// NativeWind + Pressable: className can swallow onPress. Disable className mapping globally.
import { remapProps } from "nativewind";
import { Pressable } from "react-native";

remapProps(Pressable, { className: false });
