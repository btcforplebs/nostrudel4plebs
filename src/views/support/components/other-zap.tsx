import { Box, Card, CardBody, CardHeader, Flex, Spacer, Text, TextProps } from "@chakra-ui/react";
import { getZapPayment, getZapRequest, getZapSender } from "applesauce-core/helpers";
import { NostrEvent } from "nostr-tools";

import UserAvatar from "../../../components/user/user-avatar";
import UserLink from "../../../components/user/user-link";
import TextNoteContents from "../../../components/note/timeline-note/text-note-contents";
import { LightningIcon } from "../../../components/icons";
import Timestamp from "../../../components/timestamp";
import UserDnsIdentityIcon from "../../../components/user/user-dns-identity-icon";
import DebugEventButton from "../../../components/debug-modal/debug-event-button";
import useEventIntersectionRef from "../../../hooks/use-event-intersection-ref";
import { TrustProvider } from "../../../providers/local/trust-provider";

export function OtherZap({ zap }: { zap: NostrEvent }) {
  const sender = getZapSender(zap);
  const request = getZapRequest(zap);
  const payment = getZapPayment(zap);

  const ref = useEventIntersectionRef(zap);

  return (
    <Card maxW="xl" w="full" ref={ref}>
      <CardHeader display="flex" gap="2" p="4" alignItems="flex-start">
        <Flex gap="2">
          <UserAvatar pubkey={sender} size="sm" />
          <Flex direction="column">
            <Flex alignItems="center" gap="2">
              <UserLink pubkey={sender} fontWeight="bold" />
              <UserDnsIdentityIcon pubkey={sender} />
              <LightningIcon color="yellow.400" />
              {payment?.amount && <Text fontSize="md">{(payment.amount / 1000).toLocaleString()}</Text>}
            </Flex>
          </Flex>
        </Flex>

        <Flex gap="2" ml="auto" alignItems="center">
          <Timestamp timestamp={zap.created_at} />
          <DebugEventButton event={zap} size="sm" variant="ghost" />
        </Flex>
      </CardHeader>

      {request.content && (
        <CardBody px="4" pt="0" pb="4">
          <TrustProvider event={request}>
            <TextNoteContents event={request} />
          </TrustProvider>
        </CardBody>
      )}
    </Card>
  );
}