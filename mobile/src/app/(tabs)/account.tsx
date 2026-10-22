import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "react-native";

const Account = () => {
  return (
    <SafeAreaView
      edges={["top"]}
      className="flex-1 items-center justify-center bg-background"
    >
      <Text className="text-muted-foreground">Account coming soon</Text>
    </SafeAreaView>
  );
};

export default Account;
