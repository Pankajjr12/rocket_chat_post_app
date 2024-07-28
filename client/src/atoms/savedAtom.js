// atoms/savedPostsAtom.js
import { atom } from 'recoil';

const savedPostsAtom = atom({
  key: 'savedPostsAtom',
  default: [], // Default value for saved posts
});

export default savedPostsAtom;
