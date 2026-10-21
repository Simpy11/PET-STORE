import { getDocsFromServer, onSnapshot as listen } from 'firebase/firestore';
import { withTimeout, subscribeWithTimeout } from './requestState';

export const getDocs = source => withTimeout(() => getDocsFromServer(source()));
export const onSnapshot = (source, next, onError = console.error) => subscribeWithTimeout(
  (ready, fail) => listen(source(), { includeMetadataChanges: true }, snapshot => {
    // Do not mistake an empty offline cache for an empty server collection.
    if (!snapshot.metadata.fromCache) ready(snapshot);
  }, fail), next, onError,
);
