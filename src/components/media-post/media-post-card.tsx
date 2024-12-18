import { Box, ButtonGroup, Card, CardBody, CardFooter, CardHeader, IconButton } from "@chakra-ui/react";
import { NostrEvent } from "nostr-tools";
import { Link as RouterLink } from "react-router-dom";

import UserAvatarLink from "../user/user-avatar-link";
import UserLink from "../user/user-link";
import UserDnsIdentity from "../user/user-dns-identity";
import DebugEventButton from "../debug-modal/debug-event-button";
import { TrustProvider } from "../../providers/local/trust-provider";
import EventReactionButtons from "../event-reactions/event-reactions";
import AddReactionButton from "../note/timeline-note/components/add-reaction-button";
import RepostButton from "../note/timeline-note/components/repost-button";
import QuoteEventButton from "../note/quote-event-button";
import MediaPostSlides from "./media-slides";
import MediaPostContents from "./media-post-content";
import { getSharableEventAddress } from "../../services/relay-hints";
import { ThreadIcon } from "../icons";
import EventZapIconButton from "../zap/event-zap-icon-button";
import Timestamp from "../timestamp";

export default function MediaPost({ post }: { post: NostrEvent }) {
  const nevent = getSharableEventAddress(post);

  return (
    <TrustProvider event={post}>
      <Card maxW="2xl" mx="auto">
        <CardHeader display="flex" alignItems="center" gap="2" p="2">
          <UserAvatarLink pubkey={post.pubkey} />
          <Box>
            <UserLink pubkey={post.pubkey} fontWeight="bold" /> <Timestamp timestamp={post.created_at} />
            <br />
            <UserDnsIdentity pubkey={post.pubkey} />
          </Box>

          <IconButton
            as={RouterLink}
            to={`/media/${nevent}`}
            icon={<ThreadIcon boxSize={5} />}
            ml="auto"
            aria-label="Comments"
          />
        </CardHeader>

        <CardBody p="0" position="relative" display="flex" flexDirection="column" gap="2" minH="md">
          <MediaPostSlides post={post} />

          {post.content.length > 0 && <MediaPostContents post={post} px="2" />}
        </CardBody>

        <CardFooter p="2" display="flex" gap="2">
          <ButtonGroup size="sm" variant="ghost">
            <EventZapIconButton event={post} aria-label="Zap post" />
            <AddReactionButton event={post} />
            <EventReactionButtons event={post} max={4} />
          </ButtonGroup>

          <ButtonGroup size="sm" variant="ghost" ml="auto">
            <RepostButton event={post} />
            <QuoteEventButton event={post} />
            <DebugEventButton event={post} variant="ghost" ml="auto" size="sm" alignSelf="flex-start" />
          </ButtonGroup>
        </CardFooter>
      </Card>
    </TrustProvider>
  );
}