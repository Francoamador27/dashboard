import { Turnstile } from '@marsidev/react-turnstile';

const TurnstileCaptcha = ({ onVerify }) => {
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

  return (
    <Turnstile
      siteKey={siteKey}
      onSuccess={(token) => {
        onVerify(token); // devuelve el token al componente padre
      }}
    />
  );
};

export default TurnstileCaptcha;
