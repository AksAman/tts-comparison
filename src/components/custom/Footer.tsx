import { cn } from "@/lib/utils";
import { Github, Twitter } from "lucide-react";
import Link from "next/link";
import React from "react";
interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = (props) => {
  return (
    <footer
      className={cn(
        "fixed bottom-0 flex h-12 w-full items-center justify-between bg-gray-900 px-2 text-white",
        props.className,
      )}
    >
      <div>
        Note: No API keys leave your browser and are stored in local storage.
      </div>
      <div className="flex gap-2">
        <Link href="https://twitter.com/amankrsingh03" target="_blank">
          <Twitter width={20} />
        </Link>
        <Link href="https://github.com/AksAman" target="_blank">
          <Github width={20} />
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
