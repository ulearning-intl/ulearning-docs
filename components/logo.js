import Image from 'next/image'
 
export default function Logo({ height }) {
  return (

      <Image
        src="/img/logo.png"
        alt="Hello"
        width={143}
        height={32}
      />

  );
}

