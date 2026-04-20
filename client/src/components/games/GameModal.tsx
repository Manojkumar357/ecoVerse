import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import WasteSegregation from "./WasteSegregation";
import EcoHome from "./EcoHome";

export type GameModalProps = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  gameId: string | null;
  title?: string;
  points?: number;
  onCompleted?: (opts: { gameId: string; points: number }) => void;
};

export default function GameModal({ open, onOpenChange, gameId, title, points = 0, onCompleted }: GameModalProps) {
  const handleComplete = () => {
    if (gameId && onCompleted) onCompleted({ gameId, points });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{title || 'Play'}</DialogTitle>
        </DialogHeader>
        <div className="mt-2">
          {gameId === 'waste-segregation' && (
            <WasteSegregation onComplete={handleComplete} />
          )}
          {gameId === 'eco-home' && (
            <EcoHome onComplete={handleComplete} />
          )}
          {/* Fallback */}
          {!['waste-segregation','eco-home'].includes(gameId || '') && (
            <div className="text-sm text-earth-muted">This game is coming soon.</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
