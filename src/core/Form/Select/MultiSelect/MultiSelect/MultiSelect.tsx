import React, { Component } from 'react';
import { default as styled } from 'styled-components';
import classnames from 'classnames';
import { SuomifiThemeProp, SuomifiThemeConsumer } from '../../../../theme';
import { HtmlDiv } from '../../../../../reset';
import { getOwnerDocument } from '../../../../../utils/common';
import { AutoId } from '../../../../utils/AutoId/AutoId';
import { Debounce } from '../../../../utils/Debounce/Debounce';
import { Popover } from '../../../../Popover/Popover';
import {
  FilterInput,
  FilterInputStatus,
} from '../../../FilterInput/FilterInput';
import { SelectItemList } from '../../BaseSelect/SelectItemList/SelectItemList';
import { SelectItem } from '../../BaseSelect/SelectItem/SelectItem';
import { SelectEmptyItem } from '../../BaseSelect/SelectEmptyItem/SelectEmptyItem';
import { VisuallyHidden } from '../../../../VisuallyHidden/VisuallyHidden';
import { MultiSelectChipList } from '../MultiSelectChipList/MultiSelectChipList';
import { MultiSelectRemoveAllButton } from '../MultiSelectRemoveAllButton/MultiSelectRemoveAllButton';
import { baseStyles } from './MultiSelect.baseStyles';
import { InputToggleButton } from '../../../InputToggleButton/InputToggleButton';
import { SelectSuggestion } from '../../BaseSelect/SelectSuggestion/SelectSuggestion';

const baseClassName = 'fi-multiselect';
const multiSelectClassNames = {
  open: `${baseClassName}--open`,
  error: `${baseClassName}--error`,
  content_wrapper: `${baseClassName}_content_wrapper`,
  removeAllButton: `${baseClassName}_removeAllButton`,
};

export interface MultiSelectData {
  /** Unique label that will be shown on MultiSelect item and used on filter */
  labelText: string;
  /** Using labelText if chipText is not given */
  chipText?: string;
  /** Item selection disabled for the user */
  disabled?: boolean;
  /** Unique id to identify the item */
  uniqueItemId: string;
}

interface CheckedProp {
  checked: boolean;
}

export type MultiSelectStatus = FilterInputStatus & {};

export interface MultiSelectProps<T extends MultiSelectData> {
  /** MultiSelect container div class name for custom styling. */
  className?: string;
  /** Items for the MultiSelect */
  items: Array<T & MultiSelectData>;
  /**
   * Unique id
   * If no id is specified, one will be generated automatically
   */
  id?: string;
  /** Label */
  labelText: string;
  /** Text to mark a field optional. Wrapped in parentheses and shown after labelText. */
  optionalText?: string;
  /** Hint text to be shown below the label */
  hintText?: string;
  /** Event that is fired when item selections change. Not fired when in controlled state. */
  onItemSelectionsChange?: (selectedItems: Array<T>) => void;
  /** Show chip list */
  chipListVisible?: boolean;
  /** Chip action label */
  ariaChipActionLabel?: string;
  /** Label for remove button. If it is given, button will be shown. */
  removeAllButtonLabel?: string;
  /** Placeholder text for input. Use only as visual aid, not for instructions. */
  visualPlaceholder?: string;
  /** Text to show when no items to show, e.g filtered all out */
  noItemsText: string;
  /** Default selected items */
  defaultSelectedItems?: Array<T & MultiSelectData>;
  /** Event sent when filter changes */
  onChange?: (value: string) => void;
  /** onBlur event handler */
  onBlur?: () => void;
  /** Debounce time in milliseconds for onChange function. No debounce is applied if no value is given. */
  debounce?: number;
  /**
   * 'default' | 'error'
   * @default default
   */
  status?: MultiSelectStatus;
  /** Status text to be shown below the component and hint text. Use e.g. for validation error */
  statusText?: string;
  /** Controlled items; if item is in array, it is selected. If item has disabled: true, it will be disabled. */
  selectedItems?: Array<T & MultiSelectData>;
  /** Selecting the item will send event with the id */
  onItemSelect?: (uniqueItemId: string) => void;
  /** Event to be sent when pressing remove all button */
  onRemoveAll?: () => void;
  /** Text for screen reader to indicate how many items are selected */
  ariaSelectedAmountText: string;
  /** Text for screen reader indicating the amount of available options after filtering by typing. Will be read after the amount.
   * E.g 'options available' as prop value would result in '{amount} options available' being read by screen reader upon removal.
   */
  ariaOptionsAvailableText: string;
  /** Text for screen reader to read, after labelText/chipText, when selected option is removed from chip list.
   * E.g 'removed' as prop value would result in '{option} removed' being read by screen reader upon removal.
   */
  ariaOptionChipRemovedText: string;
  /** Disable the input */
  disabled?: boolean;
  /** Whether the user can add their own custom items as the input's value */
  allowItemAddition?: boolean;
}

interface MultiSelectState<T extends MultiSelectData> {
  filterInputValue: string;
  filteredItems: T[];
  computedItems: Array<T & MultiSelectData>;
  showPopover: boolean;
  showOptionsAvailableText: boolean;
  focusedDescendantId: string | null;
  selectedItems: Array<T & MultiSelectData>;
  chipRemovalAnnounceText: string;
}

class BaseMultiSelect<T> extends Component<
  MultiSelectProps<T & MultiSelectData> & SuomifiThemeProp
> {
  private popoverListRef: React.RefObject<HTMLUListElement>;

  private filterInputRef: React.RefObject<HTMLInputElement>;

  private toggleButtonRef: React.RefObject<HTMLButtonElement>;

  private chipRemovalAnnounceTimeOut: ReturnType<typeof setTimeout> | null =
    null;

  constructor(props: MultiSelectProps<T & MultiSelectData> & SuomifiThemeProp) {
    super(props);
    this.popoverListRef = React.createRef();
    this.filterInputRef = React.createRef();
    this.toggleButtonRef = React.createRef();
  }

  state: MultiSelectState<T & MultiSelectData> = {
    filterInputValue: '',
    filteredItems: this.props.items,
    showPopover: false,
    showOptionsAvailableText: false,
    focusedDescendantId: null,
    selectedItems: this.props.selectedItems
      ? this.props.selectedItems || []
      : this.props.defaultSelectedItems || [],
    chipRemovalAnnounceText: '',
    computedItems: this.props.items,
  };

  static getDerivedStateFromProps<U>(
    nextProps: MultiSelectProps<U & MultiSelectData>,
    prevState: MultiSelectState<U & MultiSelectData>,
  ) {
    const { selectedItems } = nextProps;
    if (
      'selectedItems' in nextProps &&
      selectedItems !== prevState.selectedItems
    ) {
      return {
        selectedItems: selectedItems || prevState.selectedItems || [],
      };
    }
    return null;
  }

  componentWillUnmount() {
    if (this.chipRemovalAnnounceTimeOut) {
      clearTimeout(this.chipRemovalAnnounceTimeOut);
    }
  }

  handleItemSelection = (item: T & MultiSelectData) => {
    this.setState(
      (
        prevState: MultiSelectState<T & MultiSelectData>,
        prevProps: MultiSelectProps<T & MultiSelectData>,
      ) => {
        const {
          onItemSelectionsChange,
          onItemSelect,
          selectedItems: controlledItems,
        } = prevProps;
        let userAddedSelectedItems: Array<T & MultiSelectData> =
          prevState.selectedItems.filter((si) =>
            prevProps.items.every((pi) => pi.uniqueItemId !== si.uniqueItemId),
          );
        if (!item.disabled) {
          if (onItemSelect) {
            onItemSelect(item.uniqueItemId);
          }
          if (!controlledItems) {
            if (
              prevState.selectedItems.find(
                (prevItem) => prevItem.uniqueItemId === item.uniqueItemId,
              )
            ) {
              const newSelectedItems = prevState.selectedItems.filter(
                (selectedItem) =>
                  selectedItem.uniqueItemId !== item.uniqueItemId,
              );
              if (onItemSelectionsChange) {
                onItemSelectionsChange(newSelectedItems);
              }
              userAddedSelectedItems = userAddedSelectedItems.filter(
                (uasi) => uasi.uniqueItemId !== item.uniqueItemId,
              );
              return {
                selectedItems: newSelectedItems,
                computedItems: prevProps.items.concat(userAddedSelectedItems),
              };
            }
            const newSelectedItems = prevState.selectedItems.concat([item]);
            if (onItemSelectionsChange) {
              onItemSelectionsChange(newSelectedItems);
            }

            const itemIsNotFromPropItems = prevProps.items.every(
              (propItem) => propItem.uniqueItemId !== item.uniqueItemId,
            );
            if (itemIsNotFromPropItems) {
              userAddedSelectedItems = userAddedSelectedItems.concat([item]);
            }

            return {
              selectedItems: newSelectedItems,
              computedItems: prevProps.items.concat(userAddedSelectedItems),
            };
          }
        }
      },
    );
  };

  handleRemoveAllSelections = () => {
    this.setState(
      (
        prevState: MultiSelectState<T & MultiSelectData>,
        prevProps: MultiSelectProps<T & MultiSelectData>,
      ) => {
        const { selectedItems } = prevState;
        const { onItemSelectionsChange, onRemoveAll } = prevProps;
        const disabledItems = [];
        if (onRemoveAll) {
          onRemoveAll();
        }
        // eslint-disable-next-line no-restricted-syntax
        for (const item of selectedItems) {
          if (item.disabled) {
            disabledItems.push(item);
          }
        }
        if (onItemSelectionsChange) {
          onItemSelectionsChange(disabledItems);
        }
        return {
          selectedItems: disabledItems,
          computedItems: prevProps.items,
        };
      },
    );
    if (this.filterInputRef && this.filterInputRef.current) {
      this.filterInputRef.current.focus();
    }
  };

  private filter = (data: MultiSelectData, query: string) =>
    data.labelText.toLowerCase().includes(query.toLowerCase());

  private focusInInput = (ownerDocument: Document | null) =>
    ownerDocument
      ? ownerDocument.activeElement === this.filterInputRef.current
      : false;

  private focusInPopover = (ownerDocument: Document | null) =>
    ownerDocument
      ? this.popoverListRef.current?.contains(ownerDocument.activeElement)
      : false;

  private focusInToggleButton = (ownerDocument: Document | null) =>
    ownerDocument
      ? this.toggleButtonRef.current?.contains(ownerDocument.activeElement)
      : false;

  private handleBlur = () => {
    if (!!this.props.onBlur) {
      this.props.onBlur();
    }
    const ownerDocument = getOwnerDocument(this.popoverListRef);
    if (!ownerDocument) {
      return;
    }
    requestAnimationFrame(() => {
      const focusInPopover = this.focusInPopover(ownerDocument);
      const focusInInput = this.focusInInput(ownerDocument);
      const focusInToggleButton = this.focusInToggleButton(ownerDocument);

      const focusInMultiSelect =
        focusInPopover || focusInInput || focusInToggleButton;

      const userAddedSelectedItems: Array<T & MultiSelectData> =
        this.state.selectedItems.filter((si) =>
          this.props.items.every((pi) => pi.uniqueItemId !== si.uniqueItemId),
        );

      if (!focusInMultiSelect) {
        this.setState(
          (
            _prevState: MultiSelectState<T & MultiSelectData>,
            prevProps: MultiSelectProps<T & MultiSelectData>,
          ) => ({
            filterInputValue: '',
            filteredItems: prevProps.items,
            showPopover: false,
            showOptionsAvailableText: false,
            focusedDescendantId: null,
            computedItems: prevProps.items.concat(userAddedSelectedItems),
          }),
        );
      }
    });
  };

  private handleKeyDown = (event: React.KeyboardEvent) => {
    const {
      filteredItems: items,
      focusedDescendantId,
      filterInputValue,
    } = this.state;
    const index = items.findIndex(
      ({ uniqueItemId }) => uniqueItemId === focusedDescendantId,
    );

    const getNextIndex = () => (index + 1) % items.length;
    const getPreviousIndex = () =>
      index > -1 ? (index - 1 + items.length) % items.length : items.length - 1;

    const getNextItem = () => items[getNextIndex()];
    const getPreviousItem = () => items[getPreviousIndex()];

    switch (event.key) {
      case 'ArrowDown': {
        this.setState({ showPopover: true });
        const nextItem =
          this.props.allowItemAddition &&
          index === items.length - 1 &&
          filterInputValue !== '' &&
          !this.inputValueInItems()
            ? {
                uniqueItemId: filterInputValue.toLowerCase(),
                labelText: filterInputValue,
              }
            : getNextItem();
        if (nextItem) {
          this.setState({ focusedDescendantId: nextItem.uniqueItemId });
        }
        break;
      }

      case 'ArrowUp': {
        this.setState({ showPopover: true });
        const previousItem =
          this.props.allowItemAddition &&
          (!index || index === 0) &&
          filterInputValue !== '' &&
          !this.inputValueInItems()
            ? {
                uniqueItemId: filterInputValue.toLowerCase(),
                labelText: filterInputValue,
              }
            : getPreviousItem();
        if (previousItem) {
          this.setState({ focusedDescendantId: previousItem.uniqueItemId });
        }
        break;
      }

      case 'Enter': {
        if (focusedDescendantId) {
          const focusedItem = items.find(
            ({ uniqueItemId }) => uniqueItemId === focusedDescendantId,
          );

          if (focusedItem) {
            this.handleItemSelection(focusedItem);
          } else {
            // @ts-expect-error: Cannot create an object which implements unknown generic type T
            const userAddedItem: T & MultiSelectData = {
              uniqueItemId: filterInputValue.toLowerCase(),
              labelText: filterInputValue,
            };
            this.handleItemSelection(userAddedItem);
          }
        }
        break;
      }

      case 'Escape': {
        this.setState(
          (
            _prevState: MultiSelectState<T & MultiSelectData>,
            prevProps: MultiSelectProps<T & MultiSelectData>,
          ) => ({
            filterInputValue: '',
            filteredItems: prevProps.items,
          }),
        );
        this.setState({ showPopover: false, focusedDescendantId: null });
        break;
      }

      default: {
        break;
      }
    }
  };

  private clickWasInToggleButton(event: MouseEvent | KeyboardEvent) {
    return (
      !!this.toggleButtonRef &&
      (this.toggleButtonRef.current as Node).contains(event.target as Node)
    );
  }

  private handleToggleButtonClick(event: React.MouseEvent<HTMLElement>) {
    event.preventDefault();
    if (!!this.filterInputRef && this.filterInputRef.current) {
      if (document.activeElement !== this.filterInputRef.current) {
        this.filterInputRef.current.focus();
      } else {
        this.setState((prevState: MultiSelectState<T & MultiSelectData>) => ({
          showPopover: !prevState.showPopover,
          showOptionsAvailableText: !prevState.showOptionsAvailableText,
        }));
      }
    }
  }

  private disableItems = (items: MultiSelectData[]): MultiSelectData[] =>
    items.map((item) => ({
      ...item,
      disabled: true,
    }));

  private inputValueInItems = () =>
    !!this.state.computedItems.find(
      (ci) => ci.uniqueItemId === this.state.filterInputValue.toLowerCase(),
    );

  render() {
    const {
      filteredItems,
      showPopover,
      focusedDescendantId,
      selectedItems,
      filterInputValue,
      chipRemovalAnnounceText,
      computedItems,
    } = this.state;

    const {
      id,
      className,
      theme,
      labelText,
      optionalText,
      hintText,
      onItemSelectionsChange,
      chipListVisible,
      ariaChipActionLabel,
      removeAllButtonLabel,
      visualPlaceholder,
      noItemsText,
      defaultSelectedItems,
      onChange: propOnChange,
      debounce,
      status,
      statusText,
      selectedItems: controlledItems,
      onItemSelect,
      onRemoveAll,
      onBlur,
      ariaSelectedAmountText,
      ariaOptionsAvailableText,
      ariaOptionChipRemovedText,
      disabled,
      allowItemAddition,
      ...passProps
    } = this.props;

    const filteredItemsWithChecked: (T & MultiSelectData & CheckedProp)[] =
      filteredItems.map((item) => ({
        ...item,
        checked: !!selectedItems.find(
          (selectedItem) => selectedItem.uniqueItemId === item.uniqueItemId,
        ),
      }));

    const ariaActiveDescendant = focusedDescendantId
      ? `${id}-${focusedDescendantId}`
      : '';
    const popoverItemListId = `${id}-popover`;

    return (
      <>
        <HtmlDiv
          {...passProps}
          className={classnames(baseClassName, className, {
            [multiSelectClassNames.open]: showPopover,
            [multiSelectClassNames.error]: status === 'error',
          })}
        >
          <HtmlDiv
            className={classnames(multiSelectClassNames.content_wrapper, {})}
          >
            <Debounce waitFor={debounce}>
              {(debouncer: Function) => (
                <FilterInput
                  inputElementContainerProps={{
                    role: 'combobox',
                    'aria-haspopup': 'listbox',
                    'aria-owns': popoverItemListId,
                    'aria-expanded': showPopover,
                  }}
                  aria-activedescendant={ariaActiveDescendant}
                  id={id}
                  labelText={labelText}
                  optionalText={optionalText}
                  hintText={hintText}
                  items={computedItems}
                  onFilter={(filtered) =>
                    this.setState({ filteredItems: filtered })
                  }
                  filterFunc={this.filter}
                  forwardedRef={this.filterInputRef}
                  onFocus={() =>
                    this.setState({
                      showPopover: true,
                      showOptionsAvailableText: true,
                    })
                  }
                  onKeyDown={this.handleKeyDown}
                  onBlur={this.handleBlur}
                  value={filterInputValue}
                  onChange={(value: string) => {
                    if (propOnChange) {
                      debouncer(propOnChange, value);
                    }
                    this.setState({
                      filterInputValue: value,
                      showPopover: true,
                    });
                  }}
                  visualPlaceholder={visualPlaceholder}
                  status={status}
                  statusText={statusText}
                  aria-controls={popoverItemListId}
                  disabled={disabled}
                >
                  <InputToggleButton
                    open={showPopover}
                    ref={this.toggleButtonRef}
                    onClick={(event) => this.handleToggleButtonClick(event)}
                    aria-hidden={true}
                    tabIndex={-1}
                    disabled={disabled}
                  />
                </FilterInput>
              )}
            </Debounce>
            {showPopover && (
              <Popover
                sourceRef={this.filterInputRef}
                matchWidth={true}
                onKeyDown={this.handleKeyDown}
                onClickOutside={(event) => {
                  if (!this.clickWasInToggleButton(event)) {
                    this.setState({ showPopover: false });
                  }
                }}
              >
                <SelectItemList
                  id={popoverItemListId}
                  ref={this.popoverListRef}
                  focusedDescendantId={ariaActiveDescendant}
                  aria-multiselectable="true"
                >
                  <HtmlDiv>
                    {filteredItemsWithChecked.length > 0 &&
                      filteredItemsWithChecked.map((item) => {
                        const isCurrentlySelected =
                          item.uniqueItemId === focusedDescendantId;
                        return (
                          <SelectItem
                            hasKeyboardFocus={isCurrentlySelected}
                            key={`${item.uniqueItemId}_${item.checked}`}
                            id={`${id}-${item.uniqueItemId}`}
                            checked={item.checked}
                            disabled={item.disabled}
                            onClick={() => {
                              this.handleItemSelection(item);
                            }}
                            hightlightQuery={this.filterInputRef.current?.value}
                          >
                            {item.labelText}
                          </SelectItem>
                        );
                      })}

                    {filteredItemsWithChecked.length === 0 &&
                      !allowItemAddition && (
                        <SelectEmptyItem>{noItemsText}</SelectEmptyItem>
                      )}

                    {filterInputValue !== '' &&
                      !this.inputValueInItems() &&
                      allowItemAddition && (
                        <SelectSuggestion
                          hintText="Add custom item"
                          hasKeyboardFocus={
                            filterInputValue === focusedDescendantId
                          }
                          id={`${id}-${filterInputValue.toLowerCase()}`}
                          onClick={() => {
                            // @ts-expect-error: Cannot create an object which implements unknown generic type T
                            const item: T & MultiSelectData = {
                              labelText: filterInputValue,
                              uniqueItemId: filterInputValue.toLowerCase(),
                            };
                            this.handleItemSelection(item);
                            this.setState({
                              focusedDescendantId:
                                filterInputValue.toLowerCase(),
                            });
                          }}
                        >
                          {filterInputValue}
                        </SelectSuggestion>
                      )}
                  </HtmlDiv>
                </SelectItemList>
              </Popover>
            )}
            {chipListVisible && (
              <MultiSelectChipList
                sourceRef={this.filterInputRef}
                selectedItems={
                  disabled ? this.disableItems(selectedItems) : selectedItems
                }
                ariaChipActionLabel={ariaChipActionLabel}
                onClick={(item: MultiSelectData & T) => {
                  if (!!this.chipRemovalAnnounceTimeOut) {
                    clearTimeout(this.chipRemovalAnnounceTimeOut);
                  }
                  this.chipRemovalAnnounceTimeOut = setTimeout(() => {
                    this.setState({ chipRemovalAnnounceText: '' });
                  }, 1000);
                  this.setState({
                    chipRemovalAnnounceText: `${
                      item.chipText ? item.chipText : item.labelText
                    } ${ariaOptionChipRemovedText}`,
                  });
                  this.handleItemSelection(item);
                }}
              />
            )}
            <MultiSelectRemoveAllButton
              className={multiSelectClassNames.removeAllButton}
              selectedItems={
                disabled ? this.disableItems(selectedItems) : selectedItems
              }
              onClick={this.handleRemoveAllSelections}
            >
              {removeAllButtonLabel}
            </MultiSelectRemoveAllButton>
          </HtmlDiv>
        </HtmlDiv>
        {this.state.showOptionsAvailableText && (
          <>
            <VisuallyHidden aria-live="polite" aria-atomic="true">
              {selectedItems.length}
              {ariaSelectedAmountText}
            </VisuallyHidden>
            <VisuallyHidden
              aria-live="polite"
              aria-atomic="true"
              id={`${id}-filteredItems-length`}
            >
              {this.focusInInput(getOwnerDocument(this.popoverListRef)) ? (
                <>
                  {filteredItems.length}
                  {ariaOptionsAvailableText}
                </>
              ) : null}
            </VisuallyHidden>
          </>
        )}
        <VisuallyHidden
          aria-live="assertive"
          aria-atomic="true"
          id={`${id}-chip-removal-announce`}
        >
          {chipRemovalAnnounceText}
        </VisuallyHidden>
      </>
    );
  }
}

const StyledMultiSelect = styled(BaseMultiSelect)`
  ${({ theme }) => baseStyles(theme)}
`;

export class MultiSelect<T> extends Component<
  MultiSelectProps<T & MultiSelectData>
> {
  render() {
    const { id: propId, ...passProps } = this.props;
    return (
      <SuomifiThemeConsumer>
        {({ suomifiTheme }) => (
          <AutoId id={propId}>
            {(id) => (
              <StyledMultiSelect theme={suomifiTheme} id={id} {...passProps} />
            )}
          </AutoId>
        )}
      </SuomifiThemeConsumer>
    );
  }
}
