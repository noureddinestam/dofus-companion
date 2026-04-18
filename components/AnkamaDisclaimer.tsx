interface AnkamaDisclaimerProps {
  className?: string;
}

export function AnkamaDisclaimer({ className }: AnkamaDisclaimerProps) {
  return (
    <p
      className={`text-muted text-xs leading-relaxed ${className ?? ""}`.trim()}
    >
      Dofus Companion est une application <strong>non-officielle</strong>, créée
      par des fans pour des fans. <strong>Dofus®</strong> est une marque déposée
      d&apos;<strong>Ankama Games</strong>. Ce projet n&apos;est ni approuvé ni
      affilié à Ankama. Aucune lecture mémoire ni automatisation du jeu — cet
      outil est un overlay d&apos;information uniquement.
    </p>
  );
}
