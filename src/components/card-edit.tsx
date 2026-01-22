import { Text, TouchableOpacity, View, type ViewProps } from "react-native";

export interface CardEditProps extends ViewProps {
  title?: string;
  icon?: string;
  handleDelete?: () => void;
  handleEdit?: () => void;
}

export function CardEdit({ children, title, icon, handleDelete, handleEdit }: CardEditProps) {
  return (
    <View className="bg-surface rounded-2xl p-4 border border-border" style={{ opacity: 1 }}>
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          {(icon || title) && (
            <View
              className="flex-row items-center gap-2 border-b mb-2"
              style={{ borderColor: "#dadada", borderStyle: "dotted" }}
            >
              {icon && <Text className="text-xl">{icon}</Text>}
              {title && <Text className="text-lg font-semibold text-foreground">{title}</Text>}
            </View>
          )}
          {children}
        </View>
      </View>

      {(!!handleEdit || !!handleDelete) && (
        <View className="flex-row gap-2 mt-3 pt-3 border-t border-border">
          {handleEdit && (
            <TouchableOpacity
              onPress={() => handleEdit()}
              className="flex-1 bg-primary/10 rounded-lg p-2 flex-row items-center justify-center gap-2"
            >
              <Text className="text-xl">✏️</Text>
              <Text className="text-primary font-semibold">Editar</Text>
            </TouchableOpacity>
          )}
          {handleDelete && (
            <TouchableOpacity
              onPress={() => handleDelete()}
              className="flex-1 bg-red-50 dark:bg-red-900/10 rounded-lg p-2 flex-row items-center justify-center gap-2"
            >
              <Text className="text-xl">🗑️</Text>
              <Text className="text-red-600 dark:text-red-400 font-semibold">Excluir</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}
