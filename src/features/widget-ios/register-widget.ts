import { requireOptionalNativeModule } from 'expo';

type TimelineEntry = {
  date: Date;
  props: object;
};

export type NativeWidgetHandle = {
  updateTimeline: (entries: TimelineEntry[]) => void;
  updateSnapshot: (props: object) => void;
  reload: () => void;
};

/**
 * Strip `null` / non-JSON values so Expo Record → App Group storage cannot choke.
 */
export function toWidgetProps(value: object): Record<string, unknown> {
  return JSON.parse(
    JSON.stringify(value, (_key, nested) =>
      nested === null || typeof nested === 'function' || typeof nested === 'undefined'
        ? undefined
        : nested,
    ),
  ) as Record<string, unknown>;
}

function stub(name: string): NativeWidgetHandle {
  const warn = () => {
    if (__DEV__) {
      console.warn(`[widgets] ${name} unavailable`);
    }
  };
  return { updateTimeline: warn, updateSnapshot: warn, reload: warn };
}

/**
 * Register layout + return a timeline handle without going through expo-widgets'
 * JS Widget wrapper (avoids a few interop edge cases).
 *
 * `layout` must already be the babel-widgets-plugin string (or function.toString()).
 */
export function registerWidget(
  name: string,
  layout: unknown,
): NativeWidgetHandle {
  const ExpoWidgets = requireOptionalNativeModule<{
    Widget: new (name: string, layout: string) => {
      updateTimeline: (entries: { timestamp: number; props: object }[]) => void;
      reload: () => void;
    };
  }>('ExpoWidgets');

  if (ExpoWidgets == null) {
    return stub(name);
  }

  const layoutString =
    typeof layout === 'string'
      ? layout
      : typeof layout === 'function'
        ? Function.prototype.toString.call(layout)
        : null;

  if (layoutString == null || layoutString.length === 0) {
    if (__DEV__) {
      console.warn(`[widgets] ${name}: empty layout (${typeof layout})`);
    }
    return stub(name);
  }

  if (typeof layout !== 'string' && __DEV__) {
    console.warn(
      `[widgets] ${name}: layout was ${typeof layout}; coerced with toString()`,
    );
  }

  try {
    const native = new ExpoWidgets.Widget(name, layoutString);
    return {
      updateTimeline(entries) {
        native.updateTimeline(
          entries.map((entry) => ({
            timestamp: entry.date.getTime(),
            props: toWidgetProps(entry.props),
          })),
        );
      },
      updateSnapshot(props) {
        native.updateTimeline([
          { timestamp: Date.now(), props: toWidgetProps(props) },
        ]);
      },
      reload() {
        native.reload();
      },
    };
  } catch (error) {
    if (__DEV__) {
      console.warn(`[widgets] ${name}: native Widget() failed`, error);
    }
    return stub(name);
  }
}
