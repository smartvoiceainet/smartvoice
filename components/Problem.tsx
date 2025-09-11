const PainPoint = ({ icon, title, description }: { icon: string; title: string; description: string }) => {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 flex flex-col gap-4 hover:-translate-y-1 transition-transform duration-300">
      <div className="text-4xl mb-2">{icon}</div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="opacity-80 text-sm leading-relaxed">{description}</p>
    </div>
  );
};

const Problem = () => {
  return (
    <section className="bg-gradient-to-br from-slate-800 to-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-8 py-20 md:py-28">
        <div className="text-center mb-16">
          <h2 className="font-extrabold text-3xl md:text-5xl tracking-tight mb-6 max-w-3xl mx-auto">
            The Unseen Burden: What's Really Holding Your Practice Back?
          </h2>
          <p className="max-w-2xl mx-auto text-lg opacity-90 leading-relaxed">
            The constant ringing of the phone, a relentless siren stealing your focus. Every missed call represents a potential client lost. The administrative avalanche of scheduling, follow-ups, and client intake isn't just eating your time—it's consuming your passion for law and your ability to provide justice for your clients.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          <div>
            <PainPoint 
              icon="📞" 
              title="Missed Calls & Lost Leads" 
              description="Every unanswered ring is revenue walking out the door. In the competitive personal injury space, potential clients typically call 3+ firms simultaneously—and work with whoever responds first."
            />
          </div>
          
          <div>
            <PainPoint 
              icon="⏱️" 
              title="Drowning in Administrative Tasks" 
              description="You spent years mastering the law, not answering phones. Yet administrative tasks consume 67% of the average attorney's day, leaving precious little time for actual legal work."
            />
          </div>
          
          <div>
            <PainPoint 
              icon="💰" 
              title="High Cost of Human Staff" 
              description="Quality paralegals command $50,000-$70,000 annually, plus benefits and training—a crushing expense for solo practitioners and small firms trying to scale."
            />
          </div>
          
          <div>
            <PainPoint 
              icon="⚖️" 
              title="Work-Life Imbalance & Burnout" 
              description="The phone doesn't respect dinner time, weekends, or your child's soccer game. The constant tether to your practice is slowly eroding your personal life and wellbeing."
            />
          </div>
          
          <div>
            <PainPoint 
              icon="⚠️" 
              title="Fear of Missed Deadlines & Errors" 
              description="The nagging anxiety that something important will fall through the cracks grows with every new case. One missed deadline or communication error could damage a client's case—and your reputation."
            />
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-xl blur-lg"></div>
            <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 flex flex-col items-center justify-center h-full">
              <h3 className="text-xl font-bold mb-3">Ready for a Solution?</h3>
              <p className="text-center mb-4 opacity-90">Discover how Smart Voice AI is transforming law practices.</p>
              <a href="#features" className="btn btn-sm btn-outline text-white border-white/30 hover:bg-white hover:text-blue-700">
                See the Solution
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Problem;
