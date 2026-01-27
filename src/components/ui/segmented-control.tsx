import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

interface Option {
  label: string;
  value: string;
}

interface SegmentedControlProps {
  options: Option[];
  tabInit: string;
  onChange: (value: string) => void;
  className?: string;
}

export function SegmentedControl({ options, tabInit, onChange, className }: SegmentedControlProps) {
  const [value, setValue] = useState<string>(tabInit);
  const onChangeTab = (tab: string) => {
    setValue(tab);
    onChange(tab);
  };

  return (
    <View className={`bg-muted/50 rounded-xl p-1 ${className}`}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-row items-center">
          {options.map((option, index) => {
            const isActive = value === option.value;
            const isLast = index === options.length - 1;
            const nextIsActive = !isLast && value === options[index + 1].value;

            return (
              <React.Fragment key={option.value}>
                <TouchableOpacity
                  onPress={() => onChangeTab(option.value)}
                  activeOpacity={0.7}
                  className={`px-5 py-2.5 rounded-lg justify-center items-center ${isActive ? "bg-surface" : ""}`}
                  style={
                    isActive
                      ? {
                          shadowColor: "#000",
                          shadowOffset: {
                            width: 0,
                            height: 1,
                          },
                          shadowOpacity: 0.22,
                          shadowRadius: 2.22,

                          elevation: 3,
                        }
                      : {}
                  }
                >
                  <Text className={`text-sm ${isActive ? "font-bold text-foreground" : "font-medium text-muted"}`}>
                    {option.label}
                  </Text>
                </TouchableOpacity>

                {/* Vertical Divider */}
                {!isActive && !isLast && !nextIsActive && <View className="w-[1px] h-4 bg-border" />}
              </React.Fragment>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
