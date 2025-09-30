import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, Home, Sparkles, Battery } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Mood {
  id: string;
  mood_text: string;
  energy_level: number;
  created_at: string;
}

const Moods = () => {
  const navigate = useNavigate();
  const [moods, setMoods] = useState<Mood[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMoods();
    
    // Subscribe to realtime updates
    const channel = supabase
      .channel("mood_changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "mood_responses",
        },
        (payload) => {
          setMoods((current) => [payload.new as Mood, ...current]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchMoods = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("mood_responses")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les humeurs",
        variant: "destructive",
      });
    } else {
      setMoods(data || []);
    }
    setIsLoading(false);
  };

  const getEnergyColor = (level: number) => {
    if (level <= 2) return "text-destructive";
    if (level <= 3) return "text-amber-500";
    return "text-secondary";
  };

  const getEnergyLabel = (level: number) => {
    const labels = ["Très faible", "Faible", "Modérée", "Élevée", "Très élevée"];
    return labels[level - 1] || "Inconnue";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border backdrop-blur-sm bg-background/80 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8 text-primary animate-pulse" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Mood AI
              </h1>
            </div>
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              className="border-border hover:bg-muted"
            >
              <Home className="w-4 h-4 mr-2" />
              Accueil
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <section className="px-4 py-12">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12 space-y-4 animate-fade-in">
            <h2 className="text-4xl font-bold flex items-center justify-center gap-3">
              <Sparkles className="w-8 h-8 text-accent" />
              Humeurs partagées
            </h2>
            <p className="text-muted-foreground">
              Découvrez ce que ressentent les autres en ce moment
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center gap-3">
                <Brain className="w-8 h-8 text-primary animate-pulse" />
                <span className="text-lg text-muted-foreground">
                  Chargement des humeurs...
                </span>
              </div>
            </div>
          ) : moods.length === 0 ? (
            <Card className="p-12 text-center bg-card border-border">
              <Sparkles className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">Aucune humeur pour le moment</h3>
              <p className="text-muted-foreground mb-6">
                Soyez le premier à partager votre ressenti
              </p>
              <Button
                onClick={() => navigate("/")}
                className="bg-gradient-to-r from-primary to-accent"
              >
                Partager mon humeur
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {moods.map((mood, index) => (
                <Card
                  key={mood.id}
                  className="p-6 bg-card border-border hover:border-primary/50 transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <p className="text-foreground flex-1 leading-relaxed">
                        {mood.mood_text}
                      </p>
                      <div className="flex items-center gap-2 text-sm shrink-0">
                        <Battery className={`w-4 h-4 ${getEnergyColor(mood.energy_level)}`} />
                        <span className={`font-medium ${getEnergyColor(mood.energy_level)}`}>
                          {getEnergyLabel(mood.energy_level)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground border-t border-border pt-3">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        {formatDate(mood.created_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Battery className="w-3 h-3" />
                        Niveau {mood.energy_level}/5
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Moods;