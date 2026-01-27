import React from "react";
import { ActivityIndicator, FlatList, FlatListProps, RefreshControl, Text, View } from "react-native";

import { useColors } from "@/hooks/use-colors";

import { IconMapping, IconSymbol } from "./ui/icon-symbol";

interface InfiniteListProps<T> extends Omit<
  FlatListProps<T>,
  "onEndReached" | "onEndReachedThreshold" | "ListFooterComponent" | "refreshControl"
> {
  data: T[];
  onLoadMore: () => void;
  isLoadingMore: boolean;
  hasMore: boolean;
  onRefresh: () => void;
  refreshing: boolean;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode | IconMapping;
  headerComponent?: React.ReactElement | null;
}

export function InfiniteList<T>({
  data,
  onLoadMore,
  isLoadingMore,
  hasMore,
  onRefresh,
  refreshing,
  emptyMessage = "Nenhum registro encontrado",
  emptyIcon,
  headerComponent,
  ...props
}: InfiniteListProps<T>) {
  const colors = useColors();

  const renderFooter = () => {
    if (!isLoadingMore) return <View className="h-10" />;
    return (
      <View className="py-6 items-center justify-center">
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  };

  const renderEmpty = () => {
    if (refreshing) return null;
    return (
      <View className="flex-1 items-center justify-center py-12">
        {React.isValidElement(emptyIcon) ? (
          emptyIcon
        ) : (
          <IconSymbol name={(emptyIcon || "file-outline") as IconMapping} color={colors.muted} size={30} />
        )}
        <Text className="text-muted text-center text-base mt-2">{emptyMessage}</Text>
      </View>
    );
  };

  return (
    <FlatList
      data={data}
      onEndReached={() => {
        if (hasMore && !isLoadingMore && !refreshing) {
          onLoadMore();
        }
      }}
      onEndReachedThreshold={0.1}
      ListHeaderComponent={headerComponent}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={renderEmpty}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      contentContainerStyle={[{ flexGrow: 1 }, props.contentContainerStyle]}
      {...props}
    />
  );
}
