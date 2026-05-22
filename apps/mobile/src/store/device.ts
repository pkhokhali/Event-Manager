import { v4 as uuid } from 'uuid';
import { storage } from '../lib/storage';

const DEVICE_KEY = 'deviceId';

export function getDeviceId(): string {
  let id = storage.getString(DEVICE_KEY);
  if (!id) {
    id = uuid();
    storage.set(DEVICE_KEY, id);
  }
  return id;
}
