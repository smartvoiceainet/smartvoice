import config from "@/config";
import ButtonCheckout from "./ButtonCheckout";
import { motion } from "framer-motion";

// <Pricing/> displays the pricing plans for your app
// It's your Stripe config in config.js.stripe.plans[] that will be used to display the plans
// <ButtonCheckout /> renders a button that will redirect the user to Stripe checkout called the /api/stripe/create-checkout API endpoint with the correct priceId

// Define Smart Voice AI pricing plans
const smartVoiceAIPlans = [
  {
    name: "Solo Practice",
    priceId: "solo-practice",
    price: 299,
    priceAnchor: 499,
    description: "Perfect for solo attorneys looking to maximize efficiency",
    features: [
      "Up to 300 calls per month",
      "Custom voice & script training",
      "Client intake qualification",
      "Appointment scheduling",
      "Text & email notifications",
      "Case management integration",
      "9am-5pm technical support"
    ],
    isFeatured: false,
    cta: "Start Free Trial"
  },
  {
    name: "Small Firm",
    priceId: "small-firm",
    price: 599,
    priceAnchor: 899,
    description: "For growing firms with 2-5 attorneys",
    features: [
      "Up to 1,000 calls per month",
      "Custom voice & script training",
      "Client intake qualification",
      "Appointment scheduling",
      "Text & email notifications",
      "Case management integration",
      "Analytics dashboard",
      "Priority 24/7 technical support",
      "Dedicated account manager"
    ],
    isFeatured: true,
    cta: "Start Free Trial"
  },
  {
    name: "Enterprise",
    priceId: "enterprise",
    price: 1499,
    priceAnchor: null,
    description: "For established firms with 6+ attorneys",
    features: [
      "Unlimited calls",
      "Multiple custom voice profiles",
      "Advanced call routing logic",
      "Multi-location support",
      "Custom API integrations",
      "White-labeled client portal",
      "Advanced analytics & reporting",
      "24/7 VIP technical support", 
      "Quarterly strategy reviews"
    ],
    isFeatured: false,
    cta: "Contact Sales"
  }
];

const Pricing = () => {
  return (
    <section className="bg-base-200 overflow-hidden" id="pricing">
      <div className="py-24 px-8 max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="flex flex-col text-center w-full mb-20"
        >
          <p className="font-medium text-primary mb-8">Simple, Transparent Pricing</p>
          <h2 className="font-bold text-3xl lg:text-5xl tracking-tight">
            Save Thousands in Staffing Costs with Smart Voice AI
          </h2>
          <p className="mt-6 text-lg max-w-3xl mx-auto text-base-content/80">
            No long-term contracts. No hidden fees. <br />
            All plans include white-glove implementation and training at no additional cost.
          </p>
        </motion.div>

        <div className="relative flex justify-center flex-col lg:flex-row items-center lg:items-stretch gap-8">
          {smartVoiceAIPlans.map((plan, index) => (
            <motion.div
              key={plan.priceId} 
              className="relative w-full max-w-lg"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              {plan.isFeatured && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                  <span
                    className={`badge text-xs text-primary-content font-semibold border-0 bg-primary`}
                  >
                    POPULAR
                  </span>
                </div>
              )}

              {plan.isFeatured && (
                <div
                  className={`absolute -inset-[1px] rounded-[9px] bg-primary z-10`}
                ></div>
              )}

              <div className="relative flex flex-col h-full gap-5 lg:gap-8 z-10 bg-base-100 p-8 rounded-lg shadow-lg">
                <div className="flex justify-between items-center gap-4">
                  <div>
                    <p className="text-lg lg:text-xl font-bold">{plan.name}</p>
                    {plan.description && (
                      <p className="text-base-content/80 mt-2">
                        {plan.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {plan.priceAnchor && (
                    <div className="flex flex-col justify-end mb-[4px] text-lg ">
                      <p className="relative">
                        <span className="absolute bg-base-content h-[1.5px] inset-x-0 top-[53%]"></span>
                        <span className="text-base-content/80">
                          ${plan.priceAnchor}
                        </span>
                      </p>
                    </div>
                  )}
                  <p className={`text-5xl tracking-tight font-extrabold`}>
                    ${plan.price}
                  </p>
                  <div className="flex flex-col justify-end mb-[4px]">
                    <p className="text-xs text-base-content/60 uppercase font-semibold">
                      USD
                    </p>
                  </div>
                </div>
                {plan.features && (
                  <ul className="space-y-2.5 leading-relaxed text-base flex-1">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="w-[18px] h-[18px] opacity-80 shrink-0"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                            clipRule="evenodd"
                          />
                        </svg>

                        <span>{feature} </span>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="space-y-2">
                  <ButtonCheckout priceId={plan.priceId} />

                  <p className="flex items-center justify-center gap-2 text-sm text-center text-base-content/80 font-medium relative">
                    Flexible payment options available.
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
