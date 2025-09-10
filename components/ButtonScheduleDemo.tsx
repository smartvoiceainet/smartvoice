"use client";

import Link from "next/link";

// A button to schedule a demo
const ButtonScheduleDemo = ({
  extraStyle,
}: {
  extraStyle?: string;
}) => {
  return (
    <Link
      href="/voice-demo"
      className={`btn btn-outline ${extraStyle ? extraStyle : ""}`}
    >
      Schedule a Demo
    </Link>
  );
};

export default ButtonScheduleDemo;
