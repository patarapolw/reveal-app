export interface ITreeViewItem {
  name: string;
  path: string;
  data?: Record<string, any>;
  children?: ITreeViewItem[];
}

export interface IToNestedOptions {
  splitBy?: string;
  key: string;
}

export default class ToNested {
  public options: Required<IToNestedOptions> = {
    splitBy: "/",
    key: ""
  }

  constructor(options: IToNestedOptions) {
    Object.assign(this.options, options);
  }

  toNested(records: Record<string, any>[]): ITreeViewItem[] {
    const decks: string[] = Array.from(new Set(records.filter((r) => {
      return r[this.options.key];
    }).map((r) => {
      return r[this.options.key];
    }))).sort();

    const deckWithSubDecks: string[] = [];

    for (const d of decks) {
      const deck = d.split("/");
      deck.forEach((seg, i) => {
        const subDeck = deck.slice(0, i + 1).join("/");
        if (deckWithSubDecks.indexOf(subDeck) === -1) {
          deckWithSubDecks.push(subDeck);
        }
      });
    }

    const output: ITreeViewItem[] = [];

    deckWithSubDecks.forEach((d) => {
      const deck = d.split("/");
      this.recurseParseData(records.filter((r) => {
        return r[this.options.key];
      }), output, deck);
    });

    for (const r of records.filter((r) => {
      return !r[this.options.key];
    })) {
      output.push({
        name: r.title,
        path: `${r._id}`,
        data: r
      })
    }

    return output;
  }

  private recurseParseData(data: Record<string, any>[], output: ITreeViewItem[], deck: string[], _depth = 0) {
    let doLoop = true;

    while (_depth < deck.length - 1) {
      for (const c of output) {
        if (c.name === deck[_depth]) {
          c.children = c.children || [];
          this.recurseParseData(data, c.children, deck, _depth + 1);
          doLoop = false;
          break;
        }
      }

      _depth++;

      if (!doLoop) {
        break;
      }
    }

    if (doLoop && _depth === deck.length - 1) {
      const path = deck.join("/");

      const ds = data.filter((d) => d[this.options.key] === path);

      output.push({
        name: deck[_depth],
        path: path,
        children: ds.map((d) => {
          return {
            name: d.title,
            path: `${path}/${d._id}`,
            data: d
          };
        })
      });
    }
  }
}