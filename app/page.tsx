"use client";

import JsBarcode from "jsbarcode";
import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "bibliotheque.nom";

export default function Home() {
  const [libraryName, setLibraryName] = useState("");
  const [bookCode, setBookCode] = useState("");
  const [storageReady, setStorageReady] = useState(false);
  const [barcodeValid, setBarcodeValid] = useState(false);
  const codeInputRef = useRef<HTMLInputElement>(null);
  const barcodeRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    try {
      setLibraryName(localStorage.getItem(STORAGE_KEY) ?? "");
    } catch {
      // L'application reste utilisable si le stockage du navigateur est bloqué.
    }
    setStorageReady(true);
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    try {
      localStorage.setItem(STORAGE_KEY, libraryName);
    } catch {
      // L'impression reste possible même sans stockage local.
    }
  }, [libraryName, storageReady]);

  useEffect(() => {
    const svg = barcodeRef.current;
    if (!svg) return;

    svg.replaceChildren();
    if (!bookCode.trim()) {
      setBarcodeValid(false);
      return;
    }

    try {
      JsBarcode(svg, bookCode, {
        format: "CODE128",
        displayValue: false,
        width: 1.7,
        height: 52,
        margin: 0,
      });
      setBarcodeValid(true);
    } catch {
      svg.replaceChildren();
      setBarcodeValid(false);
    }
  }, [bookCode]);

  const canPrint = libraryName.trim().length > 0 && barcodeValid;

  function printLabel() {
    if (!canPrint) return;

    window.addEventListener(
      "afterprint",
      () => {
        setBookCode("");
        codeInputRef.current?.focus();
      },
      { once: true },
    );
    window.print();
  }

  return (
    <main className="page-layout mx-auto flex min-h-screen max-w-5xl flex-col items-center gap-10 px-5 py-10 md:gap-14 md:py-16">
      <header className="screen-only w-full text-center">
        <h1 className="text-4xl font-bold tracking-tight text-green-950 md:text-5xl">
          Étiquettes de bibliothèque
        </h1>
        <p className="mt-4 text-xl text-slate-700 md:text-2xl">
          Saisissez le numéro du livre, puis imprimez son étiquette.
        </p>
      </header>

      <section className="screen-only w-full max-w-2xl space-y-8" aria-label="Préparer une étiquette">
        <div>
          <label htmlFor="library-name" className="mb-3 block text-2xl font-bold">
            Nom de la bibliothèque
          </label>
          <input
            id="library-name"
            type="text"
            value={libraryName}
            onChange={(event) => setLibraryName(event.target.value)}
            placeholder="Ex. Bibliothèque municipale"
            autoComplete="organization"
            className="w-full rounded-2xl border-2 border-slate-400 bg-white px-5 py-4 text-2xl shadow-sm outline-none focus:border-green-700 focus:ring-4 focus:ring-green-200"
          />
          <p className="mt-2 text-lg text-slate-600">Ce nom est mémorisé sur cet appareil.</p>
        </div>

        <div>
          <label htmlFor="book-code" className="mb-3 block text-2xl font-bold">
            Code ou numéro du livre
          </label>
          <input
            ref={codeInputRef}
            id="book-code"
            type="text"
            value={bookCode}
            onChange={(event) => setBookCode(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                printLabel();
              }
            }}
            autoFocus
            autoComplete="off"
            spellCheck={false}
            placeholder="Scannez ou saisissez le code"
            className="w-full rounded-2xl border-2 border-slate-400 bg-white px-5 py-5 text-2xl shadow-sm outline-none focus:border-green-700 focus:ring-4 focus:ring-green-200 md:text-3xl"
          />
          {bookCode && !barcodeValid && (
            <p role="alert" className="mt-2 text-lg font-semibold text-red-700">
              Ce code contient un caractère incompatible avec CODE128.
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={printLabel}
          disabled={!canPrint}
          className="min-h-20 w-full rounded-2xl bg-green-700 px-6 py-5 text-2xl font-bold text-white shadow-lg transition-colors hover:bg-green-800 focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-green-700 disabled:cursor-not-allowed disabled:bg-slate-400 disabled:shadow-none md:text-3xl"
        >
          Imprimer l’étiquette
        </button>
        {!libraryName.trim() && (
          <p className="text-center text-lg text-slate-700">Saisissez d’abord le nom de la bibliothèque.</p>
        )}
      </section>

      <section className="preview-frame screen-preview flex w-full flex-col items-center gap-4" aria-label="Aperçu de l’étiquette">
        <h2 className="screen-only text-2xl font-bold">Aperçu de l’étiquette</h2>
        <div className="label-paper border border-slate-300 shadow-md" aria-label="Étiquette à imprimer">
          <div className="label-name">{libraryName || "Nom de la bibliothèque"}</div>
          <svg ref={barcodeRef} role="img" aria-label={bookCode ? `Code-barres ${bookCode}` : "Code-barres"} />
          <div className="label-code">{bookCode || "Code du livre"}</div>
        </div>
        <p className="screen-only text-lg text-slate-600">Format de l’étiquette : 60 × 30 mm</p>
      </section>
    </main>
  );
}
