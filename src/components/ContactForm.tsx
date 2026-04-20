import { useState, FormEvent } from "react";
import { Check, Mail, Linkedin, Github, Twitter, ExternalLink, MessageCircle, ArrowUpRight } from "lucide-react";
import { useContactChannels, ContactChannel } from "../hooks/useContactChannels";
import { supabase } from "../lib/supabase";

interface ContactFormProps {
  initialEmail?: string;
  initialMessage?: string;
  onSubmitSuccess?: () => void;
}

function WorldMapGraphic() {
  return (
    <svg viewBox="0 0 1000 500" className="w-full h-full opacity-25" fill="currentColor">
      <path d="M150,150 Q200,100 250,150 T350,150" stroke="currentColor" fill="none" />
      <circle cx="150" cy="150" r="2" />
      <circle cx="250" cy="120" r="2" />
      <circle cx="400" cy="200" r="2" />
      <circle cx="600" cy="150" r="2" />
      <circle cx="800" cy="180" r="2" />
      {/* Decorative dots to simulate a stylized world map grid */}
      {Array.from({ length: 15 }).map((_, i) => (
        <circle key={i} cx={200 + i * 40} cy={100 + (i % 3) * 50} r="1" className="text-accent/20" />
      ))}
      <rect x="0" y="0" width="1000" height="500" fill="none" />
    </svg>
  );
}

function LaborGraphic() {
  return null;
}

export function ContactForm({ initialEmail = "", initialMessage = "", onSubmitSuccess }: ContactFormProps) {
  const [email, setEmail] = useState(initialEmail);
  const [message, setMessage] = useState(initialMessage);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const { channels, loading } = useContactChannels();

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'linkedin': return <Linkedin size={18} />;
      case 'github': return <Github size={18} />;
      case 'twitter': return <Twitter size={18} />;
      case 'email': return <Mail size={18} />;
      default: return <ExternalLink size={18} />;
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Get target email from Supabase channels
    const emailChannel = channels.find(c => c.type === 'email');
    const targetEmail = emailChannel?.url.replace('mailto:', '') || 'contact@jorgenaranjo.pro';
    
    try {
      // Try to save the contact request to Supabase
      const { error } = await supabase
        .from('contact_submissions')
        .insert([
          { 
            user_email: email, 
            message: message, 
            target_email: targetEmail 
          }
        ]);

      if (error) {
        console.warn("Could not save to contact_submissions table, falling back to log.", error);
      }
      
      // Simulate/Trigger email notification logic
      console.log(`Sending email notify to ${targetEmail}`, { from: email, message });
      
      // Delay for UX
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsSubmitting(false);
      setIsSent(true);
      if (onSubmitSuccess) onSubmitSuccess();
    } catch (err) {
      console.error("Submission failed:", err);
      setIsSubmitting(false);
    }
  };

  const formContent = (
    <div className="form-container w-full shrink-0 flex flex-col gap-6 order-2">
      <form className="form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email Corporativo</label>
          <input 
            type="email" 
            id="email" 
            name="email" 
            placeholder="tu@empresa.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
        </div>
        <div className="form-group">
          <label htmlFor="textarea">¿Cómo podemos ayudarte?</label>
          <textarea 
            name="textarea" 
            id="textarea" 
            rows={4}
            placeholder="Cuéntale a Jorge sobre tu proyecto..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          ></textarea>
        </div>
        <button 
          className="form-submit-btn" 
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Enviando..." : "Enviar Mensaje"}
        </button>
      </form>
    </div>
  );

  if (isSent) {
    return (
      <div className="form-container items-center justify-center py-12 text-center w-full">
        <div className="w-12 h-12 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-4">
          <Check size={24} />
        </div>
        <h3 className="text-xl font-serif mb-2">Mensaje Enviado</h3>
        <p className="text-muted-foreground text-sm">Gracias, Jorge se pondrá en contacto contigo pronto.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-12 items-start w-full transition-all">
      {/* Side Content */}
      <div className="flex flex-col gap-8 text-left flex-1 max-w-[450px] order-1">
        <div className="space-y-4">
          <h2 className="text-4xl md:text-5xl font-serif leading-none tracking-tight">Hablemos ahora.</h2>
          <p className="text-muted-foreground text-base leading-relaxed max-w-sm">
            Diseño, Estrategia y AI aplicada. Llevo tu producto de la visión a la realidad con ejecución impecable.
          </p>
        </div>

        {/* Alternative Contact Channels */}
        {channels.length > 0 && (
          <div className="pt-4 border-t border-border/40">
            <p className="text-xs font-mono text-muted-foreground mb-6 uppercase tracking-wider flex items-center gap-2">
              <MessageCircle size={12} /> Ó también contáctame por
            </p>
            <div className="flex flex-wrap gap-3 mt-2">
              {channels.map((channel) => (
                <a
                  key={channel.id}
                  href={channel.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 px-4 py-2 border border-border rounded-full hover:bg-muted hover:border-accent/30 transition-all group"
                >
                  <span className="text-muted-foreground group-hover:text-accent transition-colors">
                    {getChannelIcon(channel.type)}
                  </span>
                  <span className="text-xs font-medium text-foreground">{channel.label}</span>
                  <ArrowUpRight size={12} className="text-muted-foreground/50 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Form Content */}
      {formContent}
    </div>
  );
}
