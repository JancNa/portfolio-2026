/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ThemeProvider } from "./ThemeContext";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { Principles } from "./components/Principles";
import { Cases } from "./components/Cases";
import { Methodology } from "./components/Methodology";
import { Experience } from "./components/Experience";
import { Footer } from "./components/Footer";

export default function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="jnaranjo-portfolio-theme">
      <div className="min-h-screen selection:bg-accent selection:text-white">
        <Navbar />
        <main className="flex flex-col">
          <Hero />
          <Principles />
          <Cases />
          <Methodology />
          <Experience />
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
}
