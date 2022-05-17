import { ResourceChannelNotValid } from "./resource-channel-not-valid";

describe('ResourceChannelNotValid', () => {
    it('should create an instance', () => {
      const resourceName: string ='';
      const channelName: string = '';
      expect(new ResourceChannelNotValid(resourceName, channelName)).toBeTruthy();
    });
  });