import { atom } from "recoil";

const selectedConversationAtom = atom({
  key: "selectedConversationAtom", // unique key for Recoil
  default: null, // no conversation selected initially
});

export default selectedConversationAtom;
