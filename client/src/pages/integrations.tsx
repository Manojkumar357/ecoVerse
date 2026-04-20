import { IntegrationSlot } from "@/components/IntegrationSlot";

export default function IntegrationsPage() {
  return (
    <div 
      className="min-h-screen text-white p-6 relative"
      style={{
        backgroundImage: 'url(/api/image/Gemini_Generated_Image_q66kckq66kckq66k.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Overlay for better text visibility */}
      <div className="absolute inset-0 bg-black/50"></div>
      
      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-xl p-6 mb-6">
          <h1 className="text-3xl font-bold text-white/90">Integrations Playground</h1>
          <p className="mt-2 text-white/70">Connect external services and tools</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <IntegrationSlot title="Drop-in Area A">
            {/* Paste or render external element here */}
            <div className="text-white/70">Waiting for content…</div>
          </IntegrationSlot>
          <IntegrationSlot title="Drop-in Area B" />
        </div>
      </div>
    </div>
  );
}
