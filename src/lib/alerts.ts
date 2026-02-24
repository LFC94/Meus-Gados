import { Alert, AlertButton, AlertOptions } from "react-native";

interface AlertAction {
  text: string;
  onPress?: () => void;
  style?: "default" | "cancel" | "destructive";
}

const defaultErrorMessage = "Ocorreu um erro";

const createButtons = (actions: AlertAction[]): AlertButton[] => {
  return actions.map((action) => ({
    text: action.text,
    onPress: action.onPress,
    style: action.style ?? ("default" as const),
  }));
};

export const alerts = {
  success: (message: string, onOk?: () => void) => {
    Alert.alert("Sucesso", message, [
      {
        text: "OK",
        onPress: onOk,
      },
    ]);
  },

  error: (message: string = defaultErrorMessage) => {
    Alert.alert("Erro", message, [{ text: "OK" }]);
  },

  confirm: (title: string, message: string, onConfirm: () => void, onCancel?: () => void) => {
    Alert.alert(
      title,
      message,
      [
        {
          text: "Cancelar",
          onPress: onCancel,
          style: "cancel",
        },
        {
          text: "Confirmar",
          onPress: onConfirm,
          style: "destructive",
        },
      ],
      { cancelable: true },
    );
  },

  warning: (title: string, message: string, onOk?: () => void) => {
    Alert.alert(title, message, [{ text: "OK", onPress: onOk }]);
  },

  custom: (title: string, message: string, actions: AlertAction[], options?: AlertOptions) => {
    Alert.alert(title, message, createButtons(actions), options);
  },
};
