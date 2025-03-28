import { Suspense, lazy } from "react";
import type { DecodeResult } from "nostr-tools/nip19";
import { CardProps, Spinner } from "@chakra-ui/react";
import { kinds } from "nostr-tools";

import EmbeddedNote from "./event-types/embedded-note";
import useSingleEvent from "../../hooks/use-single-event";
import { NostrEvent } from "../../types/nostr-event";
import { LIST_KINDS, SET_KINDS } from "../../helpers/nostr/lists";
import { STEMSTR_TRACK_KIND } from "../../helpers/nostr/stemstr";
import { TORRENT_COMMENT_KIND, TORRENT_KIND } from "../../helpers/nostr/torrents";
import { FLARE_VIDEO_KIND } from "../../helpers/nostr/video";
import { WIKI_PAGE_KIND } from "../../helpers/nostr/wiki";
import useReplaceableEvent from "../../hooks/use-replaceable-event";
import { safeDecode } from "../../helpers/nip19";
import type { EmbeddedGoalOptions } from "./event-types/embedded-goal";

import LoadingNostrLink from "../loading-nostr-link";
import EmbeddedRepost from "./event-types/embedded-repost";
import EmbeddedSetOrList from "./event-types/embedded-list";
import EmbeddedReaction from "./event-types/embedded-reaction";
import EmbeddedDM from "./event-types/embedded-dm";
import EmbeddedUnknown from "./event-types/embedded-unknown";
import { DVM_CONTENT_DISCOVERY_JOB_KIND } from "../../helpers/nostr/dvm";
import DVMCard from "../../views/discovery/dvm-feed/components/dvm-card";

const EmbeddedGoal = lazy(() => import("./event-types/embedded-goal"));
const EmbeddedArticle = lazy(() => import("./event-types/embedded-article"));
const EmbeddedCommunity = lazy(() => import("./event-types/embedded-community"));
const EmbeddedBadge = lazy(() => import("./event-types/embedded-badge"));
const EmbeddedTorrent = lazy(() => import("./event-types/embedded-torrent"));
const EmbeddedTorrentComment = lazy(() => import("./event-types/embedded-torrent-comment"));
const EmbeddedChannel = lazy(() => import("./event-types/embedded-channel"));
const EmbeddedFlareVideo = lazy(() => import("./event-types/embedded-flare-video"));
const EmbeddedEmojiPack = lazy(() => import("./event-types/embedded-emoji-pack"));
const EmbeddedZapRecept = lazy(() => import("./event-types/embedded-zap-receipt"));
const EmbeddedWikiPage = lazy(() => import("./event-types/embedded-wiki-page"));
const EmbeddedStream = lazy(() => import("./event-types/embedded-stream"));
const EmbeddedStreamMessage = lazy(() => import("./event-types/embedded-stream-message"));
const EmbeddedStemstrTrack = lazy(() => import("./event-types/embedded-stemstr-track"));
const EmbeddedFile = lazy(() => import("./event-types/embedded-file"));

export type EmbedProps = {
  goalProps?: EmbeddedGoalOptions;
};

export function EmbedEvent({
  event,
  goalProps,
  ...cardProps
}: Omit<CardProps, "children"> & { event: NostrEvent } & EmbedProps) {
  const renderContent = () => {
    switch (event.kind) {
      case kinds.ShortTextNote:
        return <EmbeddedNote event={event} {...cardProps} />;
      case kinds.Reaction:
        return <EmbeddedReaction event={event} {...cardProps} />;
      case kinds.EncryptedDirectMessage:
        return <EmbeddedDM dm={event} {...cardProps} />;
      case kinds.LiveEvent:
        return <EmbeddedStream stream={event} {...cardProps} />;
      case kinds.ZapGoal:
        return <EmbeddedGoal goal={event} {...cardProps} {...goalProps} />;
      case kinds.Emojisets:
        return <EmbeddedEmojiPack pack={event} {...cardProps} />;
      case kinds.LongFormArticle:
        return <EmbeddedArticle article={event} {...cardProps} />;
      case kinds.BadgeDefinition:
        return <EmbeddedBadge badge={event} {...cardProps} />;
      case kinds.LiveChatMessage:
        return <EmbeddedStreamMessage message={event} {...cardProps} />;
      case kinds.CommunityDefinition:
        return <EmbeddedCommunity community={event} {...cardProps} />;
      case STEMSTR_TRACK_KIND:
        return <EmbeddedStemstrTrack track={event} {...cardProps} />;
      case TORRENT_KIND:
        return <EmbeddedTorrent torrent={event} {...cardProps} />;
      case TORRENT_COMMENT_KIND:
        return <EmbeddedTorrentComment comment={event} {...cardProps} />;
      case FLARE_VIDEO_KIND:
        return <EmbeddedFlareVideo video={event} {...cardProps} />;
      case kinds.ChannelCreation:
        return <EmbeddedChannel channel={event} {...cardProps} />;
      case kinds.Repost:
      case kinds.GenericRepost:
        return <EmbeddedRepost repost={event} {...cardProps} />;
      case WIKI_PAGE_KIND:
        return <EmbeddedWikiPage page={event} {...cardProps} />;
      case kinds.Zap:
        return <EmbeddedZapRecept zap={event} {...cardProps} />;
      case kinds.FileMetadata:
        return <EmbeddedFile file={event} {...cardProps} />;
      case kinds.Handlerinformation:
        // if its a content DVM
        if (event.tags.some((t) => t[0] === "k" && t[1] === String(DVM_CONTENT_DISCOVERY_JOB_KIND)))
          return <DVMCard dvm={event} />;
    }

    if (SET_KINDS.includes(event.kind) || LIST_KINDS.includes(event.kind))
      return <EmbeddedSetOrList list={event} {...cardProps} />;

    return <EmbeddedUnknown event={event} {...cardProps} />;
  };

  return <Suspense fallback={<Spinner />}>{renderContent()}</Suspense>;
}

export function EmbedEventPointer({
  pointer,
  ...props
}: { pointer: DecodeResult } & EmbedProps & Omit<CardProps, "children">) {
  switch (pointer.type) {
    case "note": {
      const event = useSingleEvent(pointer.data);
      if (!event) return <LoadingNostrLink link={pointer} />;
      return <EmbedEvent event={event} {...props} />;
    }
    case "nevent": {
      const event = useSingleEvent(pointer.data.id, pointer.data.relays);
      if (!event) return <LoadingNostrLink link={pointer} />;
      return <EmbedEvent event={event} {...props} />;
    }
    case "naddr": {
      const event = useReplaceableEvent(pointer.data, pointer.data.relays);
      if (!event) return <LoadingNostrLink link={pointer} />;
      return <EmbedEvent event={event} {...props} />;
    }
  }
  return null;
}

export function EmbedEventNostrLink({ link, ...props }: { link: string } & EmbedProps) {
  const pointer = safeDecode(link);

  return pointer ? <EmbedEventPointer pointer={pointer} {...props} /> : <>{link}</>;
}
