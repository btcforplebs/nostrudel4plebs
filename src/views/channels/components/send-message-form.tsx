import { useCallback, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import dayjs from "dayjs";
import { kinds } from "nostr-tools";

import { Button, ButtonGroup, Flex, FlexProps, Heading } from "@chakra-ui/react";

import MagicTextArea, { RefType } from "../../../components/magic-textarea";
import useTextAreaUploadFile, { useTextAreaInsertTextWithForm } from "../../../hooks/use-textarea-upload-file";
import { DraftNostrEvent, NostrEvent } from "../../../types/nostr-event";
import { createEmojiTags, ensureNotifyPubkeys, getPubkeysMentionedInContent } from "../../../helpers/nostr/post";
import { useContextEmojis } from "../../../providers/global/emoji-provider";
import { usePublishEvent } from "../../../providers/global/publish-provider";
import InsertGifButton from "../../../components/gif/insert-gif-button";
import InsertImageButton from "../../../components/post-modal/insert-image-button";

export default function ChannelMessageForm({
  channel,
  rootId,
  ...props
}: { channel: NostrEvent; rootId?: string } & Omit<FlexProps, "children">) {
  const publish = usePublishEvent();
  const emojis = useContextEmojis();

  const [loadingMessage, setLoadingMessage] = useState("");
  const { getValues, setValue, watch, handleSubmit, formState, reset } = useForm({
    defaultValues: {
      content: "",
    },
    mode: "all",
  });
  watch("content");

  const componentRef = useRef<RefType | null>(null);
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const insertText = useTextAreaInsertTextWithForm(componentRef, getValues, setValue);
  const { onPaste } = useTextAreaUploadFile(insertText);

  const sendMessage = handleSubmit(async (values) => {
    if (!values.content) return;

    let draft: DraftNostrEvent = {
      kind: kinds.ChannelMessage,
      content: values.content,
      tags: [["e", rootId || channel.id, "", "root"]],
      created_at: dayjs().unix(),
    };

    const contentMentions = getPubkeysMentionedInContent(draft.content);
    draft = createEmojiTags(draft, emojis);
    draft = ensureNotifyPubkeys(draft, contentMentions);

    setLoadingMessage("Signing...");
    await publish("Send DM", draft, undefined, false);
    reset({ content: "" });

    // refocus input
    setTimeout(() => textAreaRef.current?.focus(), 50);
    setLoadingMessage("");
  });

  const formRef = useRef<HTMLFormElement | null>(null);

  return (
    <Flex as="form" gap="2" onSubmit={sendMessage} ref={formRef} {...props}>
      {loadingMessage ? (
        <Heading size="md" mx="auto" my="4">
          {loadingMessage}
        </Heading>
      ) : (
        <>
          <MagicTextArea
            mb="2"
            value={getValues().content}
            onChange={(e) => setValue("content", e.target.value, { shouldDirty: true })}
            rows={2}
            isRequired
            instanceRef={(inst) => (componentRef.current = inst)}
            ref={textAreaRef}
            onPaste={onPaste}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && formRef.current) formRef.current.requestSubmit();
            }}
          />
          <Flex gap="2" direction="column">
            <Button type="submit">Send</Button>
            <ButtonGroup size="sm">
              <InsertImageButton onUploaded={insertText} aria-label="Upload image" />
              <InsertGifButton onSelectURL={insertText} aria-label="Add gif" />
            </ButtonGroup>
          </Flex>
        </>
      )}
    </Flex>
  );
}
