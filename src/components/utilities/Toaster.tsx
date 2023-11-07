"use client";

import { Toaster as SonnerToaster } from "sonner";
import React from "react";
type ToasterProps = React.ComponentProps<typeof SonnerToaster>;

const Toaster: React.FC<ToasterProps> = (props) => {
  return <SonnerToaster {...props} />;
};

export default Toaster;
