import { PaywallPanel } from "@/components/payments/paywall-panel";
import { SectionHeading } from "@/components/ui/section-heading";

export default function PaywallPage() {
  return (
    <div className="space-y-10">
      <SectionHeading
        eyebrow="Payment"
        title="Unlock Paid Answer"
        description="Razorpay ₹51 checkout plus Dev Mode bypass button."
      />
      <PaywallPanel />
    </div>
  );
}

