import FeedStatus from "./feed-status";
import { AddressPointer } from "nostr-tools/nip19";
import { getEventUID } from "applesauce-core/helpers";

import { ChainedDVMJob, getEventIdsFromJobs } from "../../../../helpers/nostr/dvm";
import useSingleEvents from "../../../../hooks/use-single-events";
import TimelineItem from "../../../../components/timeline-page/generic-note-timeline/timeline-item";

function FeedEvents({ chain }: { chain: ChainedDVMJob[] }) {
  const eventIds = getEventIdsFromJobs(chain);
  const events = useSingleEvents(eventIds);

  return (
    <>
      {events.map((event) => (
        <TimelineItem key={getEventUID(event)} event={event} visible />
      ))}
    </>
  );
}

export default function Feed({ chain, pointer }: { chain: ChainedDVMJob[]; pointer: AddressPointer }) {
  return (
    <>
      {chain.length > 0 && <FeedEvents chain={chain} />}
      <FeedStatus chain={chain} pointer={pointer} />
    </>
  );
}
