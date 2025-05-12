import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react-native";
import { Separator } from "@/components/ui/separator";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <View style={styles.footer}>
      <View style={styles.container}>
        <View style={styles.grid}>
          <View style={styles.column}>
            <View style={styles.logo}>
              <View style={styles.logoIcon}>
                <Text style={styles.logoText}>B</Text>
              </View>
              <Text style={styles.logoTitle}>BudgetU</Text>
            </View>
            <Text style={styles.description}>
              Financial management designed specifically for college students.
            </Text>
            <View style={styles.socialLinks}>
              <TouchableOpacity style={styles.socialLink}>
                <Facebook size={20} color="#666" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialLink}>
                <Instagram size={20} color="#666" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialLink}>
                <Twitter size={20} color="#666" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialLink}>
                <Linkedin size={20} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.column}>
            <Text style={styles.columnTitle}>Features</Text>
            <View style={styles.linkList}>
              <TouchableOpacity><Text style={styles.link}>Budget Creation</Text></TouchableOpacity>
              <TouchableOpacity><Text style={styles.link}>Expense Tracking</Text></TouchableOpacity>
              <TouchableOpacity><Text style={styles.link}>Safe-to-Spend</Text></TouchableOpacity>
              <TouchableOpacity><Text style={styles.link}>Financial Insights</Text></TouchableOpacity>
            </View>
          </View>

          <View style={styles.column}>
            <Text style={styles.columnTitle}>Company</Text>
            <View style={styles.linkList}>
              <TouchableOpacity><Text style={styles.link}>About Us</Text></TouchableOpacity>
              <TouchableOpacity><Text style={styles.link}>Careers</Text></TouchableOpacity>
              <TouchableOpacity><Text style={styles.link}>Blog</Text></TouchableOpacity>
              <TouchableOpacity><Text style={styles.link}>Press</Text></TouchableOpacity>
            </View>
          </View>

          <View style={styles.column}>
            <Text style={styles.columnTitle}>Support</Text>
            <View style={styles.linkList}>
              <TouchableOpacity><Text style={styles.link}>Help Center</Text></TouchableOpacity>
              <TouchableOpacity><Text style={styles.link}>Contact Us</Text></TouchableOpacity>
              <TouchableOpacity><Text style={styles.link}>Privacy Policy</Text></TouchableOpacity>
              <TouchableOpacity><Text style={styles.link}>Terms of Service</Text></TouchableOpacity>
            </View>
          </View>
        </View>

        <Separator style={styles.separator} />

        <View style={styles.bottom}>
          <Text style={styles.copyright}>
            © {currentYear} BudgetU. All rights reserved.
          </Text>
          <View style={styles.bottomLinks}>
            <TouchableOpacity><Text style={styles.bottomLink}>Privacy Policy</Text></TouchableOpacity>
            <TouchableOpacity><Text style={styles.bottomLink}>Terms of Service</Text></TouchableOpacity>
            <TouchableOpacity><Text style={styles.bottomLink}>Cookie Policy</Text></TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    paddingTop: 64,
    paddingBottom: 32,
  },
  container: {
    paddingHorizontal: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 48,
    gap: 32,
  },
  column: {
    flex: 1,
    minWidth: 250,
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  logoIcon: {
    height: 32,
    width: 32,
    backgroundColor: '#8B5CF6',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  logoTitle: {
    fontWeight: 'bold',
    fontSize: 20,
  },
  description: {
    color: '#666',
    marginBottom: 16,
  },
  socialLinks: {
    flexDirection: 'row',
    gap: 16,
  },
  socialLink: {
    padding: 8,
  },
  columnTitle: {
    fontWeight: '600',
    marginBottom: 16,
  },
  linkList: {
    gap: 8,
  },
  link: {
    color: '#666',
  },
  separator: {
    marginBottom: 32,
  },
  bottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 16,
  },
  copyright: {
    fontSize: 14,
    color: '#666',
  },
  bottomLinks: {
    flexDirection: 'row',
    gap: 24,
  },
  bottomLink: {
    fontSize: 14,
    color: '#666',
  },
});

export default Footer;
