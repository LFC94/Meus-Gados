import { JSX } from "react";
import { Text, TouchableOpacity, View, type ViewProps } from "react-native";

import { useColors } from "@/hooks";

import { IconMapping, IconSymbol } from "./icon-symbol";

export interface CardEditProps extends ViewProps {
  title?: string;
  icon?: IconMapping;
  iconColor?: string;
  label?: JSX.Element;
  handleDelete?: () => void;
  handleEdit?: () => void;
}

export function CardEdit({ children, title, icon, iconColor, label, handleDelete, handleEdit, style }: CardEditProps) {
  const colors = useColors();

  return (
    <View className="bg-surface rounded-2xl p-4 border border-border" style={style}>
      {(icon || title || label) && (
        <View
          className="flex-row items-center gap-2 border-b mb-2"
          style={{ borderColor: `${colors.border}50`, paddingBottom: label ? 2 : 0 }}
        >
          {icon && <IconSymbol name={icon} color={iconColor ? iconColor : colors.foreground} />}
          {title && <Text className="flex-1 text-lg font-semibold text-foreground">{title}</Text>}
          {label}
        </View>
      )}
      {children}

      {(!!handleEdit || !!handleDelete) && (
        <View className={`flex-row gap-2  ${children ? " mt-3 pt-3 border-t border-border" : ""}`}>
          {handleEdit && (
            <TouchableOpacity
              onPress={() => handleEdit()}
              className="flex-1 bg-primary/10 border border-primary rounded-lg p-2 flex-row items-center justify-center gap-2"
            >
              <IconSymbol name="edit" color={colors.primary} />
              <Text className="text-primary font-semibold">Editar</Text>
            </TouchableOpacity>
          )}
          {handleDelete && (
            <TouchableOpacity
              onPress={() => handleDelete()}
              className="flex-1 bg-error/10 border border-error rounded-lg p-2 flex-row items-center justify-center gap-2"
            >
              <IconSymbol name="delete" color={colors.error} />
              <Text className="text-error font-semibold">Excluir</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}
