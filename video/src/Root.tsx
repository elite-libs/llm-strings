import { Composition } from "remotion";
import { LlmStringsDemo } from "./LlmStringsDemo";

export const RemotionRoot = () => {
  return (
    <Composition
      id="LlmStringsDemo"
      component={LlmStringsDemo}
      durationInFrames={360}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
