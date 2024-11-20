import * as pushover from "./pushover";

const FORM_TITLE = `Form Submission: image-survey`;
const UNIQUE_KEY = "arizona";

// message: "\n    Name: ba626cfd-a9d5-47bb-8acf-cd3bddb55a3b\n    Email: \n    Message: [\"arizona1\"]\n    Timestamp: Wed Nov 20 2024 01:25:52 GMT+0000 (Coordinated Universal Time)\n  ",
const parseVotingResults = (message: string) => {
  const arrayMatch = message.match(/Message:\s*(\[[^\]]+\])/);
  if (arrayMatch) {
    const array = JSON.parse(arrayMatch[1]);
    return array;
  } else {
    console.log("Array not found in the message.");
    return null;
  }
};

const main = async () => {
  const votingTotal: Record<string, number> = {};

  const { secret } = await pushover.login();
  //   const registerDevice = await pushover.registerDevice({ secret });
  //   if(registerDevice.errors){
  //     console.log('Failed to register: ', registerDevice.errors)
  //   }
  const { messages } = await pushover.fetchMessages({ secret });
  messages.forEach(async ({ title, message }) => {
    if (title === FORM_TITLE) {
      const userVotes = parseVotingResults(message);
      if (userVotes) {
        userVotes.forEach((vote: string) => {
          if (vote.indexOf(UNIQUE_KEY) === -1) {
            console.log("Skipping invalid vote: ", vote);
            return;
          }

          if (votingTotal[vote]) {
            votingTotal[vote]++;
          } else {
            votingTotal[vote] = 1;
          }
        });
      }
    }
  });

  const sortedVotingTotal = Object.entries(votingTotal)
    .sort((a, b) => b[1] - a[1])
    .forEach(([k, v]) => console.log(`${k}: ${v}`));
};

main();
