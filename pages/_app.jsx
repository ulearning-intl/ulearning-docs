import "../styles.css";
import FloatingAssistant from "../components/floating-assistant";

export default function Nextra({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <FloatingAssistant />
    </>
  );
}
