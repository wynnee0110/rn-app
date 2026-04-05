import { useAuth, useClerk, useSignIn } from "@clerk/expo";
import { type Href, Link, useRouter } from "expo-router";
import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function SignInPage() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const { isLoaded } = useAuth();
  const { client } = useClerk();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [code, setCode] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  // Track MFA step with local state for reliable rendering
  const [pendingMfa, setPendingMfa] = React.useState(false);

  if (!isLoaded) return null;

  const handleSubmit = async () => {
    const { error } = await signIn.password({ emailAddress, password });
    if (error) {
      console.error(JSON.stringify(error, null, 2));
      return;
    }

    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: ({ decorateUrl }) => {
          const url = decorateUrl("/");
          router.replace(url as Href);
        },
      });
    } else if (signIn.status === "needs_client_trust") {
      const emailCodeFactor = signIn.supportedSecondFactors?.find(
        (f) => f.strategy === "email_code"
      );
      if (emailCodeFactor) {
        await signIn.mfa.sendEmailCode();
        setPendingMfa(true);
      }
    }
  };

  const handleVerify = async () => {
    try {
      const { error } = await signIn.mfa.verifyEmailCode({ code });

      if (error) {
        console.error("Verification failed:", JSON.stringify(error, null, 2));
        return;
      }

      if (client.signIn.status === "complete") {
        await signIn.finalize({
          navigate: ({ decorateUrl }) => {
            const url = decorateUrl("/");
            router.replace(url as Href);
          },
        });
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    }
  };

  // ── MFA verification panel ───────────────────────────────────────────────
  if (pendingMfa) {
    return (
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Pressable
            style={styles.backBtn}
            onPress={() => {
              signIn.reset();
              setPendingMfa(false);
            }}
          >
            <Text style={styles.backText}>← Back</Text>
          </Pressable>

          <View style={styles.iconBox}>
            <Text style={styles.iconEmoji}>🔐</Text>
          </View>

          <Text style={styles.title}>Verify your identity</Text>
          <Text style={styles.subtitle}>
            Enter the code we sent to your email.
          </Text>

          <Text style={styles.label}>Verification code</Text>
          <TextInput
            style={styles.input}
            value={code}
            placeholder="000000"
            placeholderTextColor="#9CA3AF"
            onChangeText={setCode}
            keyboardType="number-pad"
            maxLength={6}
            textContentType="oneTimeCode"
            autoFocus
          />
          {errors?.fields?.code && (
            <Text style={styles.errorText}>{errors.fields.code.message}</Text>
          )}

          <Pressable
            style={({ pressed }) => [
              styles.button,
              (fetchStatus === "fetching" || code.length < 6) &&
              styles.buttonDisabled,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleVerify}
            disabled={fetchStatus === "fetching" || code.length < 6}
          >
            <Text style={styles.buttonText}>
              {fetchStatus === "fetching" ? "Verifying…" : "Verify"}
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.ghostBtn,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => signIn.mfa.sendEmailCode()}
          >
            <Text style={styles.ghostBtnText}>Resend code</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // ── Sign-in form ─────────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <View style={styles.logoRow}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoLetter}>B</Text>
          </View>
          <Text style={styles.appName}>BudgetApp</Text>
        </View>

        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to your account</Text>

        {/* Email */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Email address</Text>
          <TextInput
            style={styles.input}
            autoCapitalize="none"
            value={emailAddress}
            placeholder="you@example.com"
            placeholderTextColor="#9CA3AF"
            onChangeText={setEmailAddress}
            keyboardType="email-address"
            textContentType="emailAddress"
          />
          {errors?.fields?.identifier && (
            <Text style={styles.errorText}>
              {errors.fields.identifier.message}
            </Text>
          )}
        </View>

        {/* Password */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordRow}>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              value={password}
              placeholder="Enter your password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!showPassword}
              onChangeText={setPassword}
              textContentType="password"
            />
            <Pressable
              style={styles.eyeBtn}
              onPress={() => setShowPassword((v) => !v)}
            >
              <Text style={styles.eyeText}>{showPassword ? "🙈" : "👁"}</Text>
            </Pressable>
          </View>
          {errors?.fields?.password && (
            <Text style={styles.errorText}>
              {errors.fields.password.message}
            </Text>
          )}
        </View>

        {/* Submit */}
        <Pressable
          style={({ pressed }) => [
            styles.button,
            (!emailAddress || !password || fetchStatus === "fetching") &&
            styles.buttonDisabled,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleSubmit}
          disabled={!emailAddress || !password || fetchStatus === "fetching"}
        >
          <Text style={styles.buttonText}>
            {fetchStatus === "fetching" ? "Signing in…" : "Sign in"}
          </Text>
        </Pressable>

        {/* Sign-up link */}
        <View style={styles.linkRow}>
          <Text style={styles.linkText}>
            {"Don't have an account? "}
          </Text>
          <Link href="/(auth)/sign-up">
            <Text style={styles.link}>Sign up</Text>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const PURPLE = "#6C47FF";

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: "#FAFAFA" },
  container: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 56,
    gap: 8,
  },

  // Logo row
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 36,
  },
  logoCircle: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: PURPLE,
    justifyContent: "center",
    alignItems: "center",
  },
  logoLetter: { color: "#fff", fontSize: 20, fontWeight: "700" },
  appName: { fontSize: 19, fontWeight: "700", color: "#111827" },

  // MFA screen
  backBtn: { marginBottom: 24, alignSelf: "flex-start" },
  backText: { color: PURPLE, fontSize: 15, fontWeight: "600" },
  iconBox: { alignSelf: "center", marginBottom: 20 },
  iconEmoji: { fontSize: 56 },

  // Typography
  title: {
    fontSize: 27,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    lineHeight: 22,
    marginBottom: 28,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },

  // Fields
  fieldGroup: { gap: 0 },
  input: {
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
    backgroundColor: "#fff",
    color: "#111827",
    marginBottom: 4,
  },
  passwordRow: {
    position: "relative",
    justifyContent: "center",
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeBtn: {
    position: "absolute",
    right: 12,
    top: 0,
    bottom: 4,
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  eyeText: { fontSize: 18 },

  // Buttons
  button: {
    backgroundColor: PURPLE,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
    shadowColor: PURPLE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: { opacity: 0.45 },
  buttonPressed: { opacity: 0.8 },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  ghostBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 4,
  },
  ghostBtnText: { color: PURPLE, fontWeight: "600", fontSize: 15 },

  // Navigation
  linkRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
    gap: 2,
  },
  linkText: { color: "#6B7280", fontSize: 15 },
  link: { color: PURPLE, fontWeight: "700", fontSize: 15 },

  // Error
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: 2,
    marginBottom: 6,
  },
});