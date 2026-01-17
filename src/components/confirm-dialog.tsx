import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import { Animated, Modal, Text, TouchableOpacity, View } from "react-native";

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmStyle?: "default" | "destructive";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  confirmStyle = "default",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [animation] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.spring(animation, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(animation, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleConfirm = () => {
    if (confirmStyle === "destructive") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onConfirm();
  };

  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onCancel();
  };

  const scale = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1],
  });

  const opacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <TouchableOpacity className="flex-1 bg-black/50 justify-center items-center" activeOpacity={1} onPress={onCancel}>
        <Animated.View
          className="bg-surface rounded-2xl p-6 w-80 border border-border"
          style={{
            transform: [{ scale }],
            opacity,
          }}
        >
          {/* Title */}
          <Text className="text-xl font-bold text-foreground mb-2">{title}</Text>

          {/* Message */}
          <Text className="text-base text-muted mb-6">{message}</Text>

          {/* Buttons */}
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={handleCancel}
              className="flex-1 py-3 rounded-xl items-center border border-border"
              style={{ opacity: 1 }}
              accessibilityLabel={cancelText}
            >
              <Text className="text-base font-semibold text-foreground">{cancelText}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleConfirm}
              className={`flex-1 py-3 rounded-xl items-center ${
                confirmStyle === "destructive" ? "bg-error" : "bg-primary"
              }`}
              style={{ opacity: 1 }}
              accessibilityLabel={confirmText}
            >
              <Text className="text-base font-semibold text-white">{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}

interface AlertDialogProps {
  visible: boolean;
  title: string;
  message: string;
  buttonText?: string;
  onButtonPress?: () => void;
}

export function AlertDialog({ visible, title, message, buttonText = "OK", onButtonPress }: AlertDialogProps) {
  const [animation] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.spring(animation, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(animation, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onButtonPress) {
      onButtonPress();
    }
  };

  const scale = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1],
  });

  const opacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={handlePress}>
      <TouchableOpacity
        className="flex-1 bg-black/50 justify-center items-center"
        activeOpacity={1}
        onPress={handlePress}
      >
        <Animated.View
          className="bg-surface rounded-2xl p-6 w-80 border border-border"
          style={{
            transform: [{ scale }],
            opacity,
          }}
        >
          {/* Title */}
          <Text className="text-xl font-bold text-foreground mb-2">{title}</Text>

          {/* Message */}
          <Text className="text-base text-muted mb-6">{message}</Text>

          {/* Button */}
          <TouchableOpacity
            onPress={handlePress}
            className="bg-primary rounded-xl py-3 items-center"
            style={{ opacity: 1 }}
            accessibilityLabel={buttonText}
          >
            <Text className="text-base font-semibold text-white">{buttonText}</Text>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}
