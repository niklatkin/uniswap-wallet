import React, { ReactNode } from 'react'
import { Flex, FlexProps } from 'src/components/layout'
import { Text } from 'src/components/Text'
import { Theme } from 'ui/src/theme/restyle'

type PillProps = {
  customBackgroundColor?: string
  customBorderColor?: string
  foregroundColor?: string
  icon?: ReactNode
  label?: ReactNode
  textVariant?: keyof Theme['textVariants']
} & FlexProps

export function Pill({
  borderRadius = 'roundedFull',
  children,
  customBackgroundColor,
  customBorderColor,
  flexDirection = 'row',
  foregroundColor,
  icon,
  label,
  px = 'spacing4',
  py = 'spacing8',
  textVariant = 'bodySmall',
  ...rest
}: PillProps): JSX.Element {
  return (
    <Flex
      alignItems="center"
      borderColor="none"
      borderRadius={borderRadius}
      borderWidth={1}
      flexDirection={flexDirection}
      gap="spacing8"
      justifyContent="center"
      px={px}
      py={py}
      style={{
        ...(customBackgroundColor ? { backgroundColor: customBackgroundColor } : {}),
        ...(customBorderColor ? { borderColor: customBorderColor } : {}),
      }}
      {...rest}>
      {icon ?? null}
      {label ? (
        // eslint-disable-next-line react-native/no-inline-styles
        <Text style={{ color: foregroundColor, paddingTop: 1 }} variant={textVariant}>
          {label}
        </Text>
      ) : null}
      {children}
    </Flex>
  )
}
