import { ReactNode, useCallback, useMemo, useRef, useState } from "react";
import {
  Button,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Spinner,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { NostrConnectSigner } from "applesauce-signers/signers/nostr-connect-signer";
import { useAccountManager } from "applesauce-react/hooks";
import { NostrConnectAccount } from "applesauce-accounts/accounts";

import { NOSTR_CONNECT_PERMISSIONS } from "../../const";
import QRCodeScannerButton from "../../components/qr-code/qr-code-scanner-button";
import { RelayUrlInput } from "../../components/relay-url-input";
import QrCodeSvg from "../../components/qr-code/qr-code-svg";
import { CopyIconButton } from "../../components/copy-icon-button";

function ClientConnectForm() {
  const navigate = useNavigate();
  const urlInputRef = useRef<HTMLInputElement | null>(null);
  const [relay, setRelay] = useState("wss://relay.nsec.app/");
  const [signer, setSigner] = useState<NostrConnectSigner>();
  const [listening, setListening] = useState(false);
  const manager = useAccountManager();

  const connectionURL = useMemo(() => {
    if (!signer || !relay) return "";

    const host = location.protocol + "//" + location.host;
    const params = new URLSearchParams();
    params.set("relay", relay);
    params.set("name", "noStrudel");
    params.set("url", host);
    params.set("image", new URL("/apple-touch-icon.png", host).toString());

    return `nostrconnect://${signer.clientPubkey}?` + params.toString();
  }, [relay, signer]);

  const create = useCallback(() => {
    const tempSigner = new NostrConnectSigner({ relays: [relay] });
    setSigner(tempSigner);

    tempSigner.waitForSigner().then(async () => {
      const pubkey = await tempSigner.getPublicKey();
      setListening(false);

      const account = new NostrConnectAccount(pubkey, tempSigner);
      manager.addAccount(account);
      manager.setActive(account);
    });

    setListening(true);
  }, [relay, manager]);

  return (
    <>
      {signer ? (
        <>
          <a href={connectionURL} target="_blank" rel="noreferrer">
            <QrCodeSvg content={connectionURL} />
          </a>
          <Flex gap="2">
            <Input
              value={connectionURL}
              ref={urlInputRef}
              onFocus={() => urlInputRef.current?.select()}
              onChange={() => {}}
            />
            <CopyIconButton value={connectionURL} aria-label="Copy connection URL" />
          </Flex>
          {listening && (
            <Flex gap="2" justifyContent="center" alignItems="center" py="2">
              <Spinner />
              <Text>Waiting for connection</Text>
            </Flex>
          )}
        </>
      ) : (
        <>
          <FormControl>
            <FormLabel htmlFor="input">Connection Relay</FormLabel>
            <RelayUrlInput value={relay} onChange={(e) => setRelay(e.target.value)} />
          </FormControl>
          <Button colorScheme="primary" onClick={create}>
            Create Connection URL
          </Button>
        </>
      )}
      <Flex justifyContent="space-between" gap="2">
        <Button variant="link" onClick={() => navigate("../")} py="2">
          Back
        </Button>
      </Flex>
    </>
  );
}

export default function LoginNostrConnectView() {
  const navigate = useNavigate();
  const toast = useToast();
  const [connection, setConnection] = useState("");
  const fromClient = useDisclosure();
  const manager = useAccountManager();

  const [loading, setLoading] = useState<string | undefined>();
  const handleSubmit: React.FormEventHandler<HTMLDivElement> = async (e) => {
    e.preventDefault();

    try {
      setLoading("Connecting...");
      const signer = await NostrConnectSigner.fromBunkerURI(connection, {
        permissions: NOSTR_CONNECT_PERMISSIONS,
      });
      const pubkey = await signer.getPublicKey();

      const account = new NostrConnectAccount(pubkey, signer);
      manager.addAccount(account);
      manager.setActive(account);
    } catch (e) {
      if (e instanceof Error) toast({ status: "error", description: e.message });
    }
    setLoading(undefined);
  };

  let content: ReactNode = null;
  if (fromClient.isOpen) {
    content = <ClientConnectForm />;
  } else {
    content = (
      <>
        {loading && <Text fontSize="lg">{loading}</Text>}
        {!loading && (
          <FormControl>
            <FormLabel htmlFor="input">Remote Signer URL</FormLabel>
            <Flex gap="2">
              <Input
                id="nostr-connect"
                name="nostr-connect"
                placeholder="bunker://<pubkey>?relay=wss://relay.example.com"
                isRequired
                value={connection}
                onChange={(e) => setConnection(e.target.value)}
                autoComplete="off"
              />
              <QRCodeScannerButton onResult={(v) => setConnection(v)} />
            </Flex>
          </FormControl>
        )}
        <Flex justifyContent="space-between" gap="2">
          <Button variant="link" onClick={() => navigate("../")} py="2">
            Back
          </Button>
          <Button colorScheme="primary" type="submit" isLoading={!!loading}>
            Connect
          </Button>
        </Flex>

        <Flex w="full" alignItems="center" gap="4">
          <Divider />
          <Text fontWeight="bold">OR</Text>
          <Divider />
        </Flex>
        <Button variant="outline" onClick={fromClient.onOpen}>
          Create Connection URL
        </Button>
      </>
    );
  }

  return (
    <Flex as="form" direction="column" gap="2" onSubmit={handleSubmit} w="full">
      {content}
    </Flex>
  );
}
