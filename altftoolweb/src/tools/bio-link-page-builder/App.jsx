"use client";

import BioLinkBuilderClient from "./components/BioLinkBuilderClient";
import styles from "./styles/BioLinkBuilder.module.css";

export default function BioLinkPageBuilderApp() {
  return (
    <div className={styles.appShell}>
      <BioLinkBuilderClient />
    </div>
  );
}
