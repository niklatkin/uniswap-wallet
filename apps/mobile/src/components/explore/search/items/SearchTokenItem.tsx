import { ImpactFeedbackStyle } from 'expo-haptics'
import { default as React } from 'react'
import ContextMenu from 'react-native-context-menu-view'
import { useAppDispatch, useAppTheme } from 'src/app/hooks'
import { TouchableArea } from 'src/components/buttons/TouchableArea'
import { useExploreTokenContextMenu } from 'src/components/explore/hooks'
import { SearchContext } from 'src/components/explore/search/SearchResultsSection'
import { Box, Flex } from 'src/components/layout'
import { Text } from 'src/components/Text'
import { useTokenDetailsNavigation } from 'src/components/TokenDetails/hooks'
import WarningIcon from 'src/components/tokens/WarningIcon'
import {
  addToSearchHistory,
  SearchResultType,
  TokenSearchResult,
} from 'src/features/explore/searchHistorySlice'
import { sendMobileAnalyticsEvent } from 'src/features/telemetry'
import { ElementName, MobileEventName, SectionName } from 'src/features/telemetry/constants'
import { TokenLogo } from 'wallet/src/components/CurrencyLogo/TokenLogo'
import { SafetyLevel } from 'wallet/src/data/__generated__/types-and-hooks'
import { shortenAddress } from 'wallet/src/utils/addresses'
import { buildCurrencyId, buildNativeCurrencyId } from 'wallet/src/utils/currencyId'

type SearchTokenItemProps = {
  token: TokenSearchResult
  searchContext?: SearchContext
}

export function SearchTokenItem({ token, searchContext }: SearchTokenItemProps): JSX.Element {
  const dispatch = useAppDispatch()
  const theme = useAppTheme()
  const tokenDetailsNavigation = useTokenDetailsNavigation()

  const { chainId, address, name, symbol, logoUrl, safetyLevel } = token
  const currencyId = address ? buildCurrencyId(chainId, address) : buildNativeCurrencyId(chainId)

  const onPress = (): void => {
    tokenDetailsNavigation.preload(currencyId)
    tokenDetailsNavigation.navigate(currencyId)
    if (searchContext) {
      sendMobileAnalyticsEvent(MobileEventName.ExploreSearchResultClicked, {
        query: searchContext.query,
        name: name ?? '',
        chain: token.chainId,
        address: address ?? '',
        type: 'token',
        suggestion_count: searchContext.suggestionCount,
        position: searchContext.position,
        isHistory: searchContext.isHistory,
      })
    }
    dispatch(
      addToSearchHistory({
        searchResult: {
          type: SearchResultType.Token,
          chainId,
          address,
          name,
          symbol,
          logoUrl,
          safetyLevel,
        },
      })
    )
  }

  const { menuActions, onContextMenuPress } = useExploreTokenContextMenu({
    address,
    chainId,
    currencyId,
    analyticsSection: SectionName.ExploreSearch,
  })

  return (
    <ContextMenu actions={menuActions} onPress={onContextMenuPress}>
      <TouchableArea
        hapticFeedback
        hapticStyle={ImpactFeedbackStyle.Light}
        testID={ElementName.SearchTokenItem}
        onPress={onPress}>
        <Flex row alignItems="center" gap="spacing12" px="spacing8" py="spacing12">
          <TokenLogo chainId={chainId} symbol={symbol} url={logoUrl ?? undefined} />
          <Flex shrink alignItems="flex-start" gap="none">
            <Flex centered row gap="spacing8">
              <Flex shrink>
                <Text color="neutral1" numberOfLines={1} variant="bodyLarge">
                  {name}
                </Text>
              </Flex>
              {(safetyLevel === SafetyLevel.Blocked ||
                safetyLevel === SafetyLevel.StrongWarning) && (
                <WarningIcon
                  height={theme.iconSizes.icon16}
                  safetyLevel={safetyLevel}
                  strokeColorOverride="neutral3"
                  width={theme.iconSizes.icon16}
                />
              )}
            </Flex>
            <Flex centered row gap="spacing8">
              <Text color="neutral2" numberOfLines={1} variant="subheadSmall">
                {symbol}
              </Text>
              {address && (
                <Box flexShrink={1}>
                  <Text color="neutral3" numberOfLines={1} variant="subheadSmall">
                    {shortenAddress(address)}
                  </Text>
                </Box>
              )}
            </Flex>
          </Flex>
        </Flex>
      </TouchableArea>
    </ContextMenu>
  )
}
