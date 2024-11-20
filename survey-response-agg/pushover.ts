import getEnv from "./setup";
const env = getEnv();

const LOGIN_URL = "https://api.pushover.net/1/users/login.json";
const REGISTER_DEVICES_URL = "https://api.pushover.net/1/devices.json";
const FETCH_MESSAGES_URL = "https://api.pushover.net/1/messages.json";

type LoginSuccess = {
  status: 1;
  id: string;
  secret: string;
  request: string;
};

type LoginResponse = LoginSuccess;

export const login = async () => {
  const response = await fetch(LOGIN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      email: env.PUSHOVER_EMAIL,
      password: env.PUSHOVER_PASSWORD,
    }),
  });

  return (await response.json()) as LoginResponse;
};

type RegisterDeviceArgs = {
  secret: string;
};

export const registerDevice = async ({ secret }: RegisterDeviceArgs) => {
  const response = await fetch(REGISTER_DEVICES_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      secret,
      name: env.PUSHOVER_DEVICE_NAME,
      os: "O",
    }),
  });

  return await response.json();
};

type FetchMessagesArgs = {
  secret: string;
};

type Message = {
  title: string;
  message: string;
}

type FetchMessageResponse = {
  messages: Message[]
}

export const fetchMessages = async ({ secret }: FetchMessagesArgs) => {
  const urlParams = new URLSearchParams({
    secret,
    device_name: env.PUSHOVER_DEVICE_NAME
  });
  const response = await fetch(FETCH_MESSAGES_URL + "?" + urlParams.toString());
  return await response.json() as FetchMessageResponse;
};
