import type { MergedSiteData } from "@/lib/site-data";
import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

function getSocialUrl(
  social: Record<string, { url: string }>,
  keys: string[],
): string {
  for (const key of keys) {
    const entry = social[key];
    if (entry?.url) return entry.url;
  }
  return "";
}

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#111",
    lineHeight: 1.35,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingBottom: 12,
    marginBottom: 14,
  },
  name: {
    fontSize: 24,
    fontFamily: "Times-Bold",
  },
  headline: {
    fontSize: 10,
    marginTop: 4,
    fontFamily: "Helvetica",
    color: "#333",
  },
  avatarFrame: {
    width: 94,
    height: 94,
    borderRadius: 47,
    borderWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    objectFit: "cover",
  },
  sectionBlock: {
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingBottom: 14,
    marginBottom: 14,
  },
  sectionBlockLast: {
    paddingBottom: 0,
    marginBottom: 0,
  },
  sectionTitleBar: {
    borderBottomWidth: 0,
    marginBottom: 8,
  },
  h2: {
    fontSize: 12,
    fontFamily: "Times-Bold",
    textAlign: "left",
  },
  summaryBody: {
    fontSize: 9,
    fontFamily: "Helvetica",
    color: "#222",
    textAlign: "left",
  },
  contactLine: {
    fontSize: 8,
    marginBottom: 3,
    fontFamily: "Helvetica",
    color: "#222",
    textAlign: "left",
  },
  jobTitle: {
    fontSize: 9,
    fontFamily: "Helvetica",
    fontWeight: "bold",
  },
  jobSub: {
    fontSize: 8,
    fontStyle: "italic",
    fontFamily: "Helvetica",
    color: "#333",
  },
  jobMeta: {
    fontSize: 8,
    fontFamily: "Helvetica",
    color: "#555",
    textAlign: "right",
  },
  jobDesc: {
    fontSize: 8,
    marginTop: 4,
    fontFamily: "Helvetica",
    color: "#222",
    textAlign: "left",
  },
  block: {
    marginBottom: 10,
  },
  skillChip: {
    fontSize: 7,
    backgroundColor: "#111",
    color: "#fff",
    fontFamily: "Helvetica",
    paddingHorizontal: 6,
    paddingVertical: 3,
    marginRight: 6,
    marginBottom: 8,
    borderRadius: 10,
  },
  skillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
    alignContent: "flex-start",
    marginTop: 6,
    gap: 4,
  },
  projTech: {
    fontSize: 7,
    borderWidth: 1,
    borderColor: "#ccc",
    fontFamily: "Helvetica",
    paddingHorizontal: 4,
    paddingVertical: 2,
    marginRight: 5,
    marginBottom: 6,
    borderRadius: 2,
  },
  techRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
    alignContent: "flex-start",
    marginTop: 4,
    gap: 3,
  },
});

function SectionTitle({ children }: { children: string }) {
  return (
    <View style={styles.sectionTitleBar} minPresenceAhead={48}>
      <Text style={styles.h2}>{children}</Text>
    </View>
  );
}

type Props = {
  data: MergedSiteData;
  /** Absolute origin for relative image paths, e.g. https://example.com */
  assetOrigin: string;
  /** Resolved absolute URL for avatar, or omit to skip photo */
  avatarAbsoluteUrl?: string;
};

export function CvPdfDocument({
  data: DATA,
  assetOrigin: _origin,
  avatarAbsoluteUrl,
}: Props) {
  const topProjects = DATA.projects.slice(0, 4);
  const githubUrl = getSocialUrl(DATA.contact.social, ["GitHub", "github"]);
  const linkedinUrl = getSocialUrl(DATA.contact.social, [
    "LinkedIn",
    "linkedin",
  ]);
  const portfolioUrl = DATA.url;

  return (
    <Document>
      <Page size="A4" wrap style={styles.page}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text style={styles.name}>{DATA.name}</Text>
            <Text style={styles.headline}>{DATA.description}</Text>
          </View>
          {avatarAbsoluteUrl ? (
            <View style={styles.avatarFrame}>
              {/* eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf Image is not DOM <img> */}
              <Image src={avatarAbsoluteUrl} style={styles.avatar} />
            </View>
          ) : null}
        </View>

        <View style={styles.sectionBlock} wrap>
          <SectionTitle>Summary</SectionTitle>
          <Text style={styles.summaryBody}>{DATA.summary}</Text>
        </View>

        <View style={styles.sectionBlock} wrap>
          <SectionTitle>Contact</SectionTitle>
          <Text style={styles.contactLine}>{DATA.contact.email}</Text>
          <Text style={styles.contactLine}>{DATA.contact.tel}</Text>
          {githubUrl ? (
            <Text style={styles.contactLine}>{githubUrl}</Text>
          ) : null}
          {linkedinUrl ? (
            <Text style={styles.contactLine}>{linkedinUrl}</Text>
          ) : null}
          {portfolioUrl ? (
            <Text style={styles.contactLine}>{portfolioUrl}</Text>
          ) : null}
        </View>

        <View style={styles.sectionBlock} wrap>
          <SectionTitle>Work Experience</SectionTitle>
          {DATA.work.map((item) => (
            <View
              key={`${item.company}-${item.start}`}
              style={styles.block}
              wrap
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.jobTitle}>{item.company}</Text>
                  <Text style={styles.jobSub}>{item.title}</Text>
                </View>
                <Text style={styles.jobMeta}>
                  {item.start} - {item.end || "Present"}
                </Text>
              </View>
              <Text style={styles.jobDesc}>{item.description}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionBlock} wrap>
          <SectionTitle>Education</SectionTitle>
          {DATA.education.map((item) => (
            <View
              key={`${item.school}-${item.start}`}
              style={styles.block}
              wrap
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.jobTitle}>{item.school}</Text>
                  <Text style={styles.jobSub}>{item.degree}</Text>
                </View>
                <Text style={styles.jobMeta}>
                  {item.start} - {item.end}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.sectionBlock} wrap>
          <SectionTitle>Skills</SectionTitle>
          <View style={styles.skillRow} wrap>
            {DATA.skills.map((skill) => (
              <Text key={skill} style={styles.skillChip}>
                {skill}
              </Text>
            ))}
          </View>
        </View>

        <View style={styles.sectionBlockLast} wrap>
          <SectionTitle>Key Projects</SectionTitle>
          {topProjects.map((project) => (
            <View key={project.title} style={styles.block} wrap>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text style={[styles.jobTitle, { flex: 1 }]}>
                  {project.title}
                </Text>
                <Text style={[styles.jobMeta, { marginLeft: 6 }]}>
                  {"dates" in project ? (project.dates ?? "") : ""}
                </Text>
              </View>
              <Text style={styles.jobDesc}>{project.description}</Text>
              <View style={styles.techRow}>
                {project.technologies.map((tech) => (
                  <Text
                    key={`${project.title}-${tech}`}
                    style={styles.projTech}
                  >
                    {tech}
                  </Text>
                ))}
              </View>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}
