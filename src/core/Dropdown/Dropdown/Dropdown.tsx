import React, { Component, ReactNode, ReactElement } from 'react';
import { default as styled } from 'styled-components';
import classnames from 'classnames';
import {
  ListboxInput,
  ListboxButton,
  ListboxButtonProps,
  ListboxPopoverProps,
  ListboxList,
  ListboxPopover,
} from '@reach/listbox';
import { withSuomifiDefaultProps } from '../../theme/utils';
import { TokensProp, InternalTokensProp } from '../../theme';
import { baseStyles, listboxPopoverStyles } from './Dropdown.baseStyles';
import { DropdownItemProps } from '../DropdownItem/DropdownItem';
import { HtmlSpan } from '../../../reset';
import { LabelText, LabelMode } from '../../Form/LabelText/LabelText';
import { logger } from '../../../utils/logger';
import { AutoId } from '../../../utils/AutoId';
import { positionMatchWidth } from '@reach/popover';

const baseClassName = 'fi-dropdown';

export const dropdownClassNames = {
  baseClassName,
  label: `${baseClassName}_label`,
  button: `${baseClassName}_button`,
  popover: `${baseClassName}_popover`,
  item: `${baseClassName}_item`,
  noSelectedStyles: `${baseClassName}--noSelectedStyles`,
  disabled: `${baseClassName}--disabled`,
  labelParagraph: `${baseClassName}_label-p`,
};

type BaseListboxPopoverProps = ListboxPopoverProps & {
  ref?: any;
};

interface DropdownState {
  selectedValue: string | undefined;
}
type OptionalListboxButtonProps = {
  [K in keyof ListboxButtonProps]?: ListboxButtonProps[K];
} & {
  className?: string;
  id?: string;
};
type OptionalListboxPopoverProps = {
  [K in keyof ListboxPopoverProps]?: ListboxPopoverProps[K];
} & {
  ref?: any;
};

export interface DropdownProps extends TokensProp {
  /**
   * Unique id
   * If no id is specified, one will be generated automatically
   */
  id?: string;
  /** Name used for input's form value. */
  name?: string;
  /** Default for non controlled Dropdown, intially selected value */
  defaultValue?: string;
  /** Controlled selected value, overrides defaultValue if provided. */
  value?: string;
  /** Label for the Dropdown component. */
  labelText: string;
  /** Visual hint to show if nothing is selected and no value or defaultValue is provided */
  visualPlaceholder?: ReactNode;
  /** Show the visual placeholder instead of selected value and act as an action menu */
  alwaysShowVisualPlaceholder?: boolean;
  /** Hide or show label. Label element is always present, but can be visually hidden.
   * @default visible
   */
  labelMode?: LabelMode;
  /** Text to mark a field optional. Will be wrapped in parentheses and shown after labelText. */
  optionalText?: string;
  /**
   * Additional label id. E.g. form group label.
   * Used in addition to labelText for screen readers.
   */
  'aria-labelledby'?: string;
  /** Custom classname to extend or customize */
  className?: string;
  /** Disable component */
  disabled?: boolean;
  /** Properties given to dropdown's Button-component, className etc. */
  dropdownButtonProps?: OptionalListboxButtonProps;
  /** Properties given to dropdown's popover-component, className etc. */
  dropdownPopoverProps?: OptionalListboxPopoverProps;
  listboxPopoverComponent?: React.ComponentType<OptionalListboxPopoverProps>;
  /** DropdownItems */
  children?:
    | Array<ReactElement<DropdownItemProps>>
    | ReactElement<DropdownItemProps>;
  /** Callback that fires when the dropdown value changes. */
  onChange?(newValue: string): void;
}

class BaseDropdown extends Component<DropdownProps> {
  state: DropdownState = {
    selectedValue:
      'value' in this.props
        ? this.props.value
        : 'defaultValue' in this.props
        ? this.props.defaultValue
        : undefined,
  };

  static getDerivedStateFromProps(
    nextProps: DropdownProps,
    prevState: DropdownState,
  ) {
    const { value } = nextProps;
    if ('value' in nextProps && value !== prevState.selectedValue) {
      return { selectedValue: value };
    }
    return null;
  }

  render() {
    const {
      id,
      name,
      disabled,
      children,
      labelText,
      labelMode,
      optionalText,
      'aria-labelledby': ariaLabelledBy,
      visualPlaceholder,
      alwaysShowVisualPlaceholder,
      className,
      dropdownButtonProps = {},
      dropdownPopoverProps = {},
      listboxPopoverComponent: ListboxPopoverComponentReplace,
      onChange: propOnChange,
      ...passProps
    } = this.props;

    if (React.Children.count(children) < 1) {
      logger.warn(`Dropdown '${labelText}' does not contain items`);
      return null;
    }

    const labelId = `${id}-label`;
    const ariaLabelledByIds = `${
      !!ariaLabelledBy ? `${ariaLabelledBy} ` : ''
    }${labelId}`;
    const buttonId = !!dropdownButtonProps.id
      ? dropdownButtonProps.id
      : `${id}_button`;

    const { selectedValue } = this.state;

    // don't read visualPlaceholder if nothing is selected
    const buttonAriaLabelledByOverride =
      selectedValue === undefined
        ? { 'aria-labelledby': ariaLabelledByIds }
        : {};

    const passDropdownPopoverProps = {
      ...dropdownPopoverProps,
      className: classnames(className, dropdownClassNames.popover, {
        [dropdownClassNames.noSelectedStyles]: !!alwaysShowVisualPlaceholder,
      }),
    };

    const onChange = (newValue: string) => {
      if (!!propOnChange) {
        propOnChange(newValue);
      }
      if (!('value' in this.props)) {
        this.setState({ selectedValue: newValue });
      }
    };

    const listboxInputProps = {
      'aria-labelledby': ariaLabelledByIds,
      disabled,
      onChange,
      name,
      value: selectedValue || '',
    };

    // If alwaysShowVisualPlaceholder is true or there is no selected value, use visualPlaceHolder.
    // With seleceted value use null and let Reach fetch the seleceted item node from internal context.
    const listboxDisplayValue = alwaysShowVisualPlaceholder
      ? visualPlaceholder
      : !!selectedValue
      ? null
      : visualPlaceholder;

    return (
      <HtmlSpan
        className={classnames(className, baseClassName)}
        id={id}
        {...passProps}
      >
        <LabelText
          id={labelId}
          labelMode={labelMode}
          as="label"
          optionalText={optionalText}
        >
          {labelText}
        </LabelText>
        <ListboxInput {...listboxInputProps}>
          <ListboxButton
            {...dropdownButtonProps}
            id={buttonId}
            className={classnames(
              dropdownClassNames.button,
              dropdownButtonProps.className,
              {
                [dropdownClassNames.disabled]: !!disabled,
              },
            )}
            {...buttonAriaLabelledByOverride}
          >
            {listboxDisplayValue}
          </ListboxButton>
          {!!ListboxPopoverComponentReplace ? (
            <ListboxPopoverComponentReplace {...passDropdownPopoverProps}>
              {children}
            </ListboxPopoverComponentReplace>
          ) : (
            <ListboxPopover
              position={positionMatchWidth}
              {...passDropdownPopoverProps}
            >
              <ListboxList>{children}</ListboxList>
            </ListboxPopover>
          )}
        </ListboxInput>
      </HtmlSpan>
    );
  }
}

const StyledDropdown = styled(
  ({
    tokens,
    id: propId,
    ...passProps
  }: DropdownProps & InternalTokensProp) => (
    <AutoId id={propId}>
      {(id) => <BaseDropdown id={id} {...passProps} />}
    </AutoId>
  ),
)`
  ${(props) => baseStyles(props)}
`;

const StyledListboxPopover = styled(
  ({
    tokens,
    children,
    ...passProps
  }: BaseListboxPopoverProps & TokensProp) => (
    <ListboxPopover position={positionMatchWidth} {...passProps}>
      <ListboxList>{children}</ListboxList>
    </ListboxPopover>
  ),
)`
  ${(props) => listboxPopoverStyles(props.theme)}
`;

/**
 * <i class="semantics" />
 * Use for selectable dropdown with items.
 */
export class Dropdown extends Component<DropdownProps> {
  render() {
    const props = withSuomifiDefaultProps(this.props);
    return (
      <StyledDropdown
        {...props}
        listboxPopoverComponent={StyledListboxPopover}
      />
    );
  }
}
