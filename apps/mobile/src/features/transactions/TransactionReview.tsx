import { useResponsiveProp } from '@shopify/restyle'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { notificationAsync } from 'expo-haptics'
import React, { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { FadeInUp, FadeOut } from 'react-native-reanimated'
import { useAppTheme } from 'src/app/hooks'
import { AddressDisplay } from 'src/components/AddressDisplay'
import { Button, ButtonEmphasis, ButtonSize } from 'src/components/buttons/Button'
import { TransferArrowButton } from 'src/components/buttons/TransferArrowButton'
import { Arrow } from 'src/components/icons/Arrow'
import { AmountInput } from 'src/components/input/AmountInput'
import { RecipientPrevTransfers } from 'src/components/input/RecipientInputPanel'
import { AnimatedFlex, Box, Flex } from 'src/components/layout'
import { NFTTransfer } from 'src/components/NFT/NFTTransfer'
import { Text } from 'src/components/Text'
import { useBiometricAppSettings, useBiometricPrompt } from 'src/features/biometrics/hooks'
import { GQLNftAsset } from 'src/features/nfts/hooks'
import { ElementName } from 'src/features/telemetry/constants'
import { dimensions, iconSizes } from 'ui/src/theme'
import { formatNumberOrString, NumberType } from 'utilities/src/format/format'
import { CurrencyLogo } from 'wallet/src/components/CurrencyLogo/CurrencyLogo'
import { CurrencyInfo } from 'wallet/src/features/dataApi/types'
import { getSymbolDisplayText } from 'wallet/src/utils/currency'

interface BaseReviewProps {
  actionButtonProps: { disabled: boolean; label: string; name: ElementName; onPress: () => void }
  isUSDInput?: boolean
  transactionDetails?: ReactNode
  nftIn?: GQLNftAsset
  currencyInInfo: Maybe<CurrencyInfo>
  currencyOutInfo?: CurrencyInfo
  formattedAmountIn?: string
  formattedAmountOut?: string
  recipient?: string
  onPrev: () => void
  inputCurrencyUSDValue?: CurrencyAmount<Currency> | null
  outputCurrencyUSDValue?: CurrencyAmount<Currency> | null
  usdTokenEquivalentAmount?: string
}

interface TransferReviewProps extends BaseReviewProps {
  recipient: string
}

interface SwapReviewProps extends BaseReviewProps {
  currencyInInfo: CurrencyInfo
  currencyOutInfo: CurrencyInfo
  formattedAmountIn: string
  formattedAmountOut: string
}

type TransactionReviewProps = TransferReviewProps | SwapReviewProps

export function TransactionReview({
  actionButtonProps,
  currencyInInfo,
  formattedAmountIn,
  currencyOutInfo,
  formattedAmountOut,
  inputCurrencyUSDValue,
  outputCurrencyUSDValue,
  nftIn,
  recipient,
  isUSDInput = false,
  transactionDetails,
  usdTokenEquivalentAmount,
  onPrev,
}: TransactionReviewProps): JSX.Element {
  const theme = useAppTheme()
  const { t } = useTranslation()

  const { trigger: actionButtonTrigger } = useBiometricPrompt(actionButtonProps.onPress)
  const { requiredForTransactions } = useBiometricAppSettings()

  const spacingGap = { xs: 'none', sm: 'spacing12' }
  const innerGap = useResponsiveProp({ xs: 'none', sm: 'spacing16' })

  const fontFamily = useResponsiveProp({
    xs: theme.textVariants.headlineSmall.fontFamily,
    sm: theme.textVariants.headlineLarge.fontFamily,
  })

  const fontSize = useResponsiveProp({
    xs: theme.textVariants.headlineSmall.fontSize,
    sm: theme.textVariants.headlineLarge.fontSize,
  })

  const lineHeight =
    useResponsiveProp({
      xs: theme.textVariants.headlineSmall.lineHeight,
      sm: theme.textVariants.headlineLarge.lineHeight,
    }) ?? theme.textVariants.headlineLarge.lineHeight

  const maxFontSizeMultiplier = useResponsiveProp({
    xs: theme.textVariants.headlineSmall.maxFontSizeMultiplier,
    sm: theme.textVariants.headlineLarge.maxFontSizeMultiplier,
  })

  const equivalentValueTextVariant = useResponsiveProp({
    xs: 'bodySmall',
    sm: 'bodyLarge',
  })

  const arrowPadding = useResponsiveProp({ xs: 'spacing4', sm: 'spacing8' })

  const amountAndEquivalentValueGap = useResponsiveProp({ xs: 'spacing4', sm: 'spacing4' })

  const formattedInputUsdValue = inputCurrencyUSDValue
    ? formatNumberOrString(inputCurrencyUSDValue?.toExact(), NumberType.FiatTokenQuantity)
    : ''
  const formattedOutputUsdValue = outputCurrencyUSDValue
    ? formatNumberOrString(outputCurrencyUSDValue?.toExact(), NumberType.FiatTokenQuantity)
    : ''

  return (
    <>
      <AnimatedFlex centered grow entering={FadeInUp} exiting={FadeOut} gap={spacingGap}>
        {currencyInInfo ? (
          <Flex centered gap={innerGap}>
            <Flex centered gap={amountAndEquivalentValueGap}>
              <Text color="neutral2" variant="bodyLarge">
                {recipient ? t('Sending') : t('You pay')}
              </Text>
              <AmountInput
                alignSelf="stretch"
                backgroundColor="none"
                borderWidth={0}
                editable={false}
                fontFamily={fontFamily}
                fontSize={fontSize}
                height={lineHeight}
                maxFontSizeMultiplier={maxFontSizeMultiplier}
                my="none"
                px="spacing16"
                py="none"
                // on review screen, number formatter will already include $ sign
                showCurrencySign={false}
                showSoftInputOnFocus={false}
                testID="amount-input-in"
                textAlign="center"
                value={formattedAmountIn}
              />
              {inputCurrencyUSDValue && !isUSDInput ? (
                <Text color="neutral2" variant={equivalentValueTextVariant}>
                  {formattedInputUsdValue}
                </Text>
              ) : null}
              {isUSDInput ? (
                <Text color="neutral2" variant={equivalentValueTextVariant}>
                  {/* when sending a token with USD input, show the amount of the token being sent */}
                  {usdTokenEquivalentAmount}
                </Text>
              ) : null}
            </Flex>
            <CurrencyLogoWithLabel currencyInfo={currencyInInfo} />
          </Flex>
        ) : nftIn ? (
          <Flex mt="spacing60">
            <NFTTransfer asset={nftIn} nftSize={dimensions.fullHeight / 5} />
          </Flex>
        ) : null}
        <TransferArrowButton disabled bg="none" borderColor="none" padding={arrowPadding} />
        {currencyOutInfo && formattedAmountOut ? (
          <Flex centered gap={innerGap} pb={{ xs: 'spacing4', sm: 'none' }}>
            <Flex centered gap={amountAndEquivalentValueGap}>
              <Text color="neutral2" variant="bodyLarge">
                {t('You receive')}
              </Text>
              <Box height={lineHeight} justifyContent="center" overflow="hidden">
                <AmountInput
                  alignSelf="stretch"
                  backgroundColor="none"
                  borderWidth={0}
                  editable={false}
                  fontFamily={fontFamily}
                  fontSize={fontSize}
                  maxFontSizeMultiplier={maxFontSizeMultiplier}
                  minHeight={2 * lineHeight}
                  showCurrencySign={isUSDInput}
                  showSoftInputOnFocus={false}
                  testID="amount-input-out"
                  textAlign="center"
                  value={formattedAmountOut}
                />
              </Box>
              {outputCurrencyUSDValue ? (
                <Text color="neutral2" variant={equivalentValueTextVariant}>
                  {formattedOutputUsdValue}
                </Text>
              ) : null}
            </Flex>
            <CurrencyLogoWithLabel currencyInfo={currencyOutInfo} />
          </Flex>
        ) : recipient ? (
          <Flex centered gap="spacing12">
            <Text color="neutral2" variant="bodyLarge">
              {t('To')}
            </Text>
            <Flex centered gap="spacing8">
              <AddressDisplay
                hideAddressInSubtitle
                address={recipient}
                size={24}
                variant="headlineMedium"
              />
              <RecipientPrevTransfers recipient={recipient} />
            </Flex>
          </Flex>
        ) : null}
      </AnimatedFlex>
      <AnimatedFlex entering={FadeInUp} exiting={FadeOut} gap="spacing12" justifyContent="flex-end">
        {transactionDetails}
        <Flex row gap="spacing8">
          <Button
            CustomIcon={
              <Arrow color={theme.colors.neutral1} direction="w" size={theme.iconSizes.icon24} />
            }
            emphasis={ButtonEmphasis.Tertiary}
            size={ButtonSize.Large}
            onPress={onPrev}
          />
          <Button
            fill
            disabled={actionButtonProps.disabled}
            label={actionButtonProps.label}
            size={ButtonSize.Large}
            testID={actionButtonProps.name}
            onPress={async (): Promise<void> => {
              await notificationAsync()
              if (requiredForTransactions) {
                await actionButtonTrigger()
              } else {
                actionButtonProps.onPress()
              }
            }}
          />
        </Flex>
      </AnimatedFlex>
    </>
  )
}

function CurrencyLogoWithLabel({ currencyInfo }: { currencyInfo: CurrencyInfo }): JSX.Element {
  const gap = useResponsiveProp({ xs: 'spacing4', sm: 'spacing8' })
  const size = useResponsiveProp({ xs: iconSizes.icon20, sm: iconSizes.icon24 })
  return (
    <Flex centered row gap={gap}>
      <CurrencyLogo currencyInfo={currencyInfo} size={size} />
      <Text color="neutral1" variant="buttonLabelLarge">
        {getSymbolDisplayText(currencyInfo.currency.symbol)}
      </Text>
    </Flex>
  )
}
