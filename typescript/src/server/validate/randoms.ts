import { v4 as uuidv4 } from 'uuid';

export interface T {
  amConfig: { [key: string]: string };
  amConfigSpark: { [key: string]: string }
}

export function initial(): T {
  const seed = Math.random()
  const atsSecretKey = uuidv4()
  return {
    amConfig: {
      CLIENT_TO_AM_TOKEN_KEY: uuidv4(),
      MR3_APPLICATION_ID_TIMESTAMP: Math.floor(seed * (9999 - 1000 + 1) + 1000) + '',
      MR3_SHARED_SESSION_ID: uuidv4().substring(0, 8),
      ATS_SECRET_KEY: atsSecretKey
    },
    amConfigSpark: {
      CLIENT_TO_AM_TOKEN_KEY: uuidv4(),
      MR3_APPLICATION_ID_TIMESTAMP: Math.floor(seed * (9999 - 1000 + 1) + 1000 + 1) + '',
      ATS_SECRET_KEY: atsSecretKey
    },
  }
}
