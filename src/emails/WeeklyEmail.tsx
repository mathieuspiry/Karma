import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

export interface WeeklyAttention {
  category: "de_toi" | "materiel" | "moment_a_deux";
  title: string;
  text: string;
  doneLink: string;
}

export interface WeeklyEmailProps {
  memberFirstName: string;
  partnerFirstName: string;
  attentions: [WeeklyAttention, WeeklyAttention, WeeklyAttention];
}

const CATEGORY_LABEL: Record<WeeklyAttention["category"], string> = {
  de_toi: "De toi",
  materiel: "Un truc matériel",
  moment_a_deux: "Un moment à deux",
};

const gold = "#c9a84c";
const bg = "#0a0a0a";
const surface = "#141414";
const fg = "#f5f0e8";
const muted = "#888880";

export default function WeeklyEmail({
  memberFirstName,
  partnerFirstName,
  attentions,
}: WeeklyEmailProps) {
  return (
    <Html lang="fr">
      <Head />
      <Preview>
        3 idées pour {partnerFirstName} cette semaine — fais-en une, c&apos;est tout.
      </Preview>
      <Body style={{ backgroundColor: bg, margin: 0, padding: 0, fontFamily: "Georgia, serif" }}>
        <Container style={{ maxWidth: 560, margin: "0 auto", padding: "40px 24px" }}>

          {/* Header */}
          <Section style={{ textAlign: "center", marginBottom: 32 }}>
            <Text
              style={{
                color: gold,
                fontSize: 13,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                margin: 0,
              }}
            >
              KARMA
            </Text>
          </Section>

          {/* Intro */}
          <Section style={{ marginBottom: 40 }}>
            <Text style={{ color: fg, fontSize: 16, lineHeight: "1.7", margin: 0 }}>
              Salut {memberFirstName},
            </Text>
            <Text style={{ color: fg, fontSize: 16, lineHeight: "1.7", marginTop: 12 }}>
              Voilà 3 idées pour {partnerFirstName} cette semaine. Fais-en une. C&apos;est tout.
            </Text>
          </Section>

          {/* Attentions */}
          {attentions.map((a) => (
            <Section
              key={a.category}
              style={{
                backgroundColor: surface,
                border: `1px solid #222`,
                padding: "24px 28px",
                marginBottom: 16,
              }}
            >
              <Text
                style={{
                  color: gold,
                  fontSize: 10,
                  letterSpacing: "0.25em",
                  textTransform: "uppercase",
                  margin: "0 0 8px",
                }}
              >
                {CATEGORY_LABEL[a.category]}
              </Text>
              <Text
                style={{
                  color: fg,
                  fontSize: 17,
                  fontWeight: "bold",
                  margin: "0 0 12px",
                  lineHeight: "1.3",
                }}
              >
                {a.title}
              </Text>
              <Text
                style={{
                  color: fg,
                  fontSize: 15,
                  lineHeight: "1.75",
                  margin: "0 0 20px",
                }}
              >
                {a.text}
              </Text>
              <Button
                href={a.doneLink}
                style={{
                  backgroundColor: gold,
                  color: bg,
                  fontSize: 11,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  padding: "10px 20px",
                  textDecoration: "none",
                  display: "inline-block",
                }}
              >
                Je l&apos;ai faite →
              </Button>
            </Section>
          ))}

          <Hr style={{ borderColor: "#222", margin: "32px 0" }} />

          {/* Footer */}
          <Section>
            <Text style={{ color: muted, fontSize: 13, lineHeight: "1.6", margin: 0 }}>
              Mathieu · choisi avec Caroline
            </Text>
            <Text style={{ color: muted, fontSize: 12, marginTop: 8 }}>
              Tu reçois ce mail parce que tu es membre Karma.{" "}
              <a href="{unsubscribeLink}" style={{ color: muted }}>
                Se désabonner
              </a>
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  );
}
