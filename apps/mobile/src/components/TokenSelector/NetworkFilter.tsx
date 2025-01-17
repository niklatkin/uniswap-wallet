import { ImpactFeedbackStyle, selectionAsync } from 'expo-haptics'
import React, { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Keyboard, LayoutAnimation, StyleSheet, VirtualizedList } from 'react-native'
import { TouchableArea } from 'src/components/buttons/TouchableArea'
import { Box, Flex } from 'src/components/layout'
import { ActionSheetModal } from 'src/components/modals/ActionSheetModal'
import { useNetworkOptions } from 'src/components/Network/hooks'
import { Text } from 'src/components/Text'
import { ModalName } from 'src/features/telemetry/constants'
import { Icons } from 'ui/src'
import EllipsisIcon from 'ui/src/assets/icons/ellipsis.svg'
import { colors, iconSizes } from 'ui/src/theme'
import {
  NetworkLogo,
  SQUARE_BORDER_RADIUS as NETWORK_LOGO_SQUARE_BORDER_RADIUS,
} from 'wallet/src/components/CurrencyLogo/NetworkLogo'
import { ALL_SUPPORTED_CHAIN_IDS, ChainId } from 'wallet/src/constants/chains'

const ELLIPSIS = 'ellipsis'
const NETWORK_ICON_SIZE = iconSizes.icon20
const NETWORK_ICON_SHIFT = 10

interface NetworkFilterProps {
  selectedChain: ChainId | null
  onPressChain: (chainId: ChainId | null) => void
  includeAllNetworks?: boolean
  showEllipsisInitially?: boolean
}

type EllipsisPosition = 'start' | 'end'

type ListItem = 'ellipsis' | number

function renderItem({ item: chainId }: { item: ListItem }): JSX.Element {
  return (
    <Box key={chainId} borderColor="surface2" style={styles.networksInSeriesIcon}>
      {chainId === ELLIPSIS ? (
        <Flex
          centered
          backgroundColor="neutral3"
          height={NETWORK_ICON_SIZE}
          style={styles.ellipsisIcon}
          width={NETWORK_ICON_SIZE}>
          <EllipsisIcon color={colors.white} height={iconSizes.icon12} width={iconSizes.icon12} />
        </Flex>
      ) : (
        <NetworkLogo chainId={chainId} shape="square" size={NETWORK_ICON_SIZE} />
      )}
    </Box>
  )
}
function keyExtractor(item: ListItem): string {
  return item.toString()
}

function NetworksInSeries({
  networks,
  ellipsisPosition,
}: {
  networks: ChainId[]
  ellipsisPosition?: EllipsisPosition
}): JSX.Element {
  const items = [
    ...(ellipsisPosition === 'start' ? [ELLIPSIS] : []),
    ...networks,
    ...(ellipsisPosition === 'end' ? [ELLIPSIS] : []),
  ] as Array<ChainId | typeof ELLIPSIS>

  const getItem = (_data: unknown, index: number): ListItem => {
    // items[index] must exists here as index is bounded by getItemCount
    return items[index] as ListItem
  }

  const getItemCount = (): number => {
    return items.length
  }

  return (
    <Box>
      <VirtualizedList<ListItem>
        contentContainerStyle={styles.networkListContainer}
        getItem={getItem}
        getItemCount={getItemCount}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
      />
    </Box>
  )
}

export function NetworkFilter({
  selectedChain,
  onPressChain,
  includeAllNetworks,
  showEllipsisInitially,
}: NetworkFilterProps): JSX.Element {
  const { t } = useTranslation()
  const [showModal, setShowModal] = useState(false)
  // TODO: remove the comment below once we add it to the main swap screen
  // we would need this later, when we add it to the main swap screen
  const [showEllipsisIcon, setShowEllipsisIcon] = useState(showEllipsisInitially ?? false)

  const onPress = useCallback(
    async (chainId: ChainId | null) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
      await selectionAsync()
      setShowModal(false)
      if (showEllipsisIcon && chainId !== selectedChain) {
        setShowEllipsisIcon(false)
      }
      onPressChain(chainId)
    },
    [showEllipsisIcon, selectedChain, onPressChain]
  )

  // design wants to limit amount of networks shown in the network filter,
  // when all networks is selected and for now we show all, but Arbitrum
  const activeChainsWithoutArbitrum = ALL_SUPPORTED_CHAIN_IDS.filter(
    (chainId) => chainId !== ChainId.ArbitrumOne
  )

  const networkOptions = useNetworkOptions({ selectedChain, onPress, includeAllNetworks })

  const networks = useMemo(() => {
    return selectedChain ? [selectedChain] : activeChainsWithoutArbitrum
  }, [activeChainsWithoutArbitrum, selectedChain])

  return (
    <>
      <TouchableArea
        hapticFeedback
        hapticStyle={ImpactFeedbackStyle.Light}
        py="spacing8"
        onPress={(): void => {
          Keyboard.dismiss()
          setShowModal(true)
        }}>
        <Flex centered row gap="spacing4" py="spacing8">
          <NetworksInSeries
            // show ellipsis as the last item when all networks is selected
            ellipsisPosition={!selectedChain ? 'end' : undefined}
            // show specific network or all
            networks={networks}
          />
          <Icons.RotatableChevron
            color="$neutral3"
            direction="s"
            height={iconSizes.icon20}
            width={iconSizes.icon20}
          />
        </Flex>
      </TouchableArea>

      <ActionSheetModal
        header={
          <Flex centered gap="spacing4" py="spacing16">
            <Text variant="buttonLabelMedium">{t('Switch Network')}</Text>
          </Flex>
        }
        isVisible={showModal}
        name={ModalName.NetworkSelector}
        options={networkOptions}
        onClose={(): void => setShowModal(false)}
      />
    </>
  )
}

const styles = StyleSheet.create({
  ellipsisIcon: {
    borderRadius: NETWORK_LOGO_SQUARE_BORDER_RADIUS,
  },
  networkListContainer: {
    flexDirection: 'row',
    paddingLeft: NETWORK_ICON_SHIFT,
  },
  networksInSeriesIcon: {
    borderRadius: 8,
    borderWidth: 2,
    marginLeft: -NETWORK_ICON_SHIFT,
  },
})
