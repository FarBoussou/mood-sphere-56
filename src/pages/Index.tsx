import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Brain, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const navigate = useNavigate();
  const [moodText, setMoodText] = useState("");
  const [energyLevel, setEnergyLevel] = useState([50]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!moodText.trim()) {
      toast({
        title: "Texte requis",
        description: "Veuillez décrire votre humeur",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Convert 0-100 slider value to 1-5 scale
    const convertedEnergy = Math.ceil((energyLevel[0] / 100) * 5);
    const finalEnergy = Math.max(1, Math.min(5, convertedEnergy));

    const { error } = await supabase
      .from("mood_responses")
      .insert({
        mood_text: moodText,
        energy_level: finalEnergy,
      });

    setIsSubmitting(false);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de partager votre humeur",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Humeur partagée !",
      description: "Votre humeur a été enregistrée avec succès",
    });

    setMoodText("");
    setEnergyLevel([50]);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/20" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40" />
        
        <div className="container relative mx-auto max-w-6xl">
          <div className="text-center space-y-6 animate-fade-in">
            <div className="inline-flex items-center gap-2 text-primary animate-float">
              <Brain className="w-12 h-12" />
              <Sparkles className="w-6 h-6" />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Mood AI
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Partagez vos émotions avec l'intelligence artificielle. 
              Une plateforme pour exprimer et explorer les humeurs collectives.
            </p>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="px-4 py-12">
        <div className="container mx-auto max-w-2xl">
          <Card className="p-8 bg-card border-border shadow-2xl animate-fade-in backdrop-blur-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold mb-2 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-accent" />
                  Partagez votre humeur
                </h2>
                <p className="text-sm text-muted-foreground">
                  Exprimez ce que vous ressentez en ce moment
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="mood" className="text-sm font-medium">
                  Comment vous sentez-vous ?
                </label>
                <Textarea
                  id="mood"
                  placeholder="Décrivez votre humeur du moment..."
                  value={moodText}
                  onChange={(e) => setMoodText(e.target.value)}
                  className="min-h-32 resize-none bg-input border-border focus:border-primary transition-colors"
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {moodText.length}/500
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">
                    Niveau d'énergie
                  </label>
                  <span className="text-2xl font-bold text-primary">
                    {energyLevel[0]}%
                  </span>
                </div>
                <Slider
                  value={energyLevel}
                  onValueChange={setEnergyLevel}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Faible</span>
                  <span>Élevée</span>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
                >
                  {isSubmitting ? "Envoi..." : "Partager mon humeur"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/moods")}
                  className="border-border hover:bg-muted"
                >
                  Voir les humeurs
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-muted-foreground">
        <p>Propulsé par l'intelligence artificielle • Mood AI © 2025</p>
      </footer>
    </div>
  );
};

export default Index;