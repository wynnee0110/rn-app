import { useAuth, useSignUp } from "@clerk/expo";
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

export default function SignUpPage() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const { isLoaded } = useAuth();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [acceptedTerms, setAcceptedTerms] = React.useState(false);
  const [code, setCode] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [verifyFlowMessage, setVerifyFlowMessage] = React.useState<string | null>(
    null
  );

  if (!isLoaded) return null;
  // if (isSignedIn) return null; // remove for testing

  const finalizeSession = async () => {
    const { error: finError } = await signUp.finalize({
      navigate: ({ decorateUrl }) => {
        router.replace(decorateUrl("/") as Href);
      },
    });
    if (finError) {
      console.error("Finalize failed:", JSON.stringify(finError, null, 2));
    }
  };

  /** Clerk can keep `missing_requirements` after email verify (e.g. legal or name). */
  const fulfillMissingSignUpFields = async (): Promise<boolean> => {
    for (let i = 0; i < 4 && signUp.status === "missing_requirements"; i++) {
      const missing = signUp.missingFields;
      const updates: Record<string, unknown> = {};

      if (missing.includes("legal_accepted") && acceptedTerms) {
        updates.legalAccepted = true;
      }
      if (missing.includes("username") && username.trim()) {
        updates.username = username.trim();
      }
      if (missing.includes("first_name") && firstName.trim()) {
        updates.firstName = firstName.trim();
      }
      if (missing.includes("last_name") && lastName.trim()) {
        updates.lastName = lastName.trim();
      }

      if (Object.keys(updates).length === 0) {
        break;
      }

      const { error: upError } = await signUp.update(
        updates as Parameters<typeof signUp.update>[0]
      );
      if (upError) {
        console.error("Sign-up update failed:", JSON.stringify(upError, null, 2));
        return false;
      }
    }
    return signUp.status === "complete";
  };

  const missingFieldsHint = (fields: readonly string[]) => {
    const labels: Record<string, string> = {
      legal_accepted: "accept the terms (go back and check the box)",
      username: "enter your username on the sign-up form",
      first_name: "enter your first name on the sign-up form",
      last_name: "enter your last name on the sign-up form",
      password: "password",
      email_address: "email",
    };
    return fields.map((f) => labels[f] ?? f).join(", ");
  };

  const handleSubmit = async () => {
    setVerifyFlowMessage(null);
    const { error } = await signUp.password({
      emailAddress,
      password,
      username: username.trim(),
      ...(acceptedTerms ? { legalAccepted: true } : {}),
      ...(firstName.trim() ? { firstName: firstName.trim() } : {}),
      ...(lastName.trim() ? { lastName: lastName.trim() } : {}),
    });
    if (error) {
      console.error(JSON.stringify(error, null, 2));
      return;
    }

    if (signUp.status === "complete") {
      await finalizeSession();
      return;
    }

    const { error: sendError } = await signUp.verifications.sendEmailCode();
    if (sendError) {
      console.error(JSON.stringify(sendError, null, 2));
      return;
    }
    setPendingVerification(true);
  };

  const handleVerify = async () => {
    setVerifyFlowMessage(null);
    const { error } = await signUp.verifications.verifyEmailCode({ code });
    if (error) {
      console.error("Verification failed:", JSON.stringify(error, null, 2));
      return;
    }

    if (signUp.status === "complete") {
      await finalizeSession();
      return;
    }

    if (signUp.status === "missing_requirements") {
      const ok = await fulfillMissingSignUpFields();
      if (ok) {
        await finalizeSession();
        return;
      }
      setVerifyFlowMessage(
        signUp.missingFields.length > 0
          ? `Almost done — please ${missingFieldsHint(signUp.missingFields)}.`
          : "Could not finish sign-up. Try again or contact support."
      );
      return;
    }

    setVerifyFlowMessage("Could not finish sign-up. Try again.");
  };

  // ── Verification panel ───────────────────────────────────────────────────
  if (pendingVerification) {
    return (
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back */}
          <Pressable
            style={styles.backBtn}
            onPress={() => {
              setPendingVerification(false);
              setVerifyFlowMessage(null);
            }}
          >
            <Text style={styles.backText}>← Back</Text>
          </Pressable>

          {/* Icon */}
          <View style={styles.iconBox}>
            <Text style={styles.iconEmoji}>📧</Text>
          </View>

          <Text style={styles.title}>Check your email</Text>
          <Text style={styles.subtitle}>
            We sent a 6-digit code to{"\n"}
            <Text style={styles.emailHighlight}>{emailAddress}</Text>
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
          {verifyFlowMessage && (
            <Text style={styles.errorText}>{verifyFlowMessage}</Text>
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
              {fetchStatus === "fetching" ? "Verifying…" : "Verify email"}
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.ghostBtn,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => void signUp.verifications.sendEmailCode()}
          >
            <Text style={styles.ghostBtnText}>Resend code</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // ── Sign-up form ─────────────────────────────────────────────────────────
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

        <Text style={styles.title}>Create an account</Text>
        <Text style={styles.subtitle}>Start tracking your spending</Text>

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
          {errors?.fields?.emailAddress && (
            <Text style={styles.errorText}>
              {errors.fields.emailAddress.message}
            </Text>
          )}
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
            value={username}
            placeholder="your_username"
            placeholderTextColor="#9CA3AF"
            onChangeText={setUsername}
            textContentType="username"
          />
          {errors?.fields?.username && (
            <Text style={styles.errorText}>
              {errors.fields.username.message}
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
              placeholder="Min. 8 characters"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!showPassword}
              onChangeText={setPassword}
              textContentType="newPassword"
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

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>First name (if required)</Text>
          <TextInput
            style={styles.input}
            value={firstName}
            placeholder="Optional"
            placeholderTextColor="#9CA3AF"
            onChangeText={setFirstName}
            textContentType="givenName"
            autoCapitalize="words"
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Last name (if required)</Text>
          <TextInput
            style={styles.input}
            value={lastName}
            placeholder="Optional"
            placeholderTextColor="#9CA3AF"
            onChangeText={setLastName}
            textContentType="familyName"
            autoCapitalize="words"
          />
        </View>

        <Pressable
          style={styles.termsRow}
          onPress={() => setAcceptedTerms((v) => !v)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: acceptedTerms }}
        >
          <View
            style={[styles.checkbox, acceptedTerms && styles.checkboxOn]}
          />
          <Text style={styles.termsText}>
            I agree to the Terms of Service and Privacy Policy
          </Text>
        </Pressable>

        {/* Submit */}
        <Pressable
          style={({ pressed }) => [
            styles.button,
            (!emailAddress ||
              !username.trim() ||
              !password ||
              !acceptedTerms ||
              fetchStatus === "fetching") &&
            styles.buttonDisabled,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleSubmit}
          disabled={
            !emailAddress ||
            !username.trim() ||
            !password ||
            !acceptedTerms ||
            fetchStatus === "fetching"
          }
        >
          <Text style={styles.buttonText}>
            {fetchStatus === "fetching" ? "Creating account…" : "Sign up"}
          </Text>
        </Pressable>

        {/* Sign-in link */}
        <View style={styles.linkRow}>
          <Text style={styles.linkText}>Already have an account? </Text>
          <Link href="/(auth)/sign-in">
            <Text style={styles.link}>Sign in</Text>
          </Link>
        </View>

        {/* Required for Clerk bot protection */}
        <View nativeID="clerk-captcha" />
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

  // Verification screen
  backBtn: { marginBottom: 24, alignSelf: "flex-start" },
  backText: { color: PURPLE, fontSize: 15, fontWeight: "600" },
  iconBox: { alignSelf: "center", marginBottom: 20 },
  iconEmoji: { fontSize: 56 },
  emailHighlight: { color: "#111827", fontWeight: "600" },

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
  termsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginTop: 8,
    marginBottom: 4,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    marginTop: 2,
    backgroundColor: "#fff",
  },
  checkboxOn: {
    borderColor: PURPLE,
    backgroundColor: PURPLE,
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
  },
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