export let data = [
    {
        'first-name': 'Иван',
        'last-name': 'Иванов',
        age: 22,
        city: 'Перник',
        payment: 222.0,
        'has-certificate': true
    },
    {
        'first-name': 'Александър',
        'last-name': 'Александров',
        age: 31,
        city: 'Враца',
        payment: 205.0,
        'has-certificate': true
    },
    {
        'first-name': 'Георги',
        'last-name': 'Георгиев',
        age: 42,
        city: 'Кюстендил',
        payment: 198.0,
        format: 'currency',
        'has-certificate': false
    },
    {
        'first-name': 'Петкан',
        'last-name': 'Славов',
        age: 72,
        city: 'Монтана',
        payment: 198.0,
        'has-certificate': false
    },
    {
        'first-name': 'Петър',
        'last-name': 'Георгиев',
        age: 32,
        city: 'Кюстендил',
        payment: 198.0,
        'has-certificate': false
    },
    {
        'first-name': 'Румен',
        'last-name': 'Георгиев',
        age: 42,
        city: 'Петрич',
        payment: 198.0,
        'has-certificate': false
    },
    {
        'first-name': 'Петър',
        'last-name': 'Иванов',
        age: 42,
        city: 'Варна',
        payment: 198.0,
        'has-certificate': false
    },
    {
        'first-name': 'Григор',
        'last-name': 'Петков',
        age: 42,
        city: 'Кюстендил',
        payment: 198.0,
        'has-certificate': false
    },
    {
        'first-name': 'Самуил',
        'last-name': 'Георгиев',
        age: 42,
        city: 'Кюстендил',
        payment: 198.0,
        'has-certificate': false
    },
    {
        'first-name': 'Димитър',
        'last-name': 'Петров',
        age: 52,
        city: 'Враца',
        payment: 198.0,
        'has-certificate': false
    },
    {
        'first-name': 'Росен',
        'last-name': 'Иванов',
        age: 42,
        city: 'Кюстендил',
        payment: 198.0,
        'has-certificate': false
    },
    {
        'first-name': 'Лили',
        'last-name': 'Тодорова',
        age: 42,
        city: 'Варна',
        payment: 198.0,
        'has-certificate': false
    },
    {
        'first-name': 'Гергана1',
        'last-name': 'Илиева1',
        age: 42,
        city: 'Петрич',
        payment: 198.0,
        'has-certificate': false
    },
    {
        'first-name': 'Гергана2',
        'last-name': 'Илиева2',
        age: 42,
        city: 'Петрич',
        payment: 198.0,
        'has-certificate': false
    },
    {
        'first-name': 'Гергана3',
        'last-name': 'Илиева3',
        age: 42,
        city: 'Петрич',
        payment: 198.0,
        'has-certificate': false
    }
];

let tableColumns = [
    {
        property: 'first-name',
        name: 'Име',
        headerClass: 'bold',
        cellClass: 'center'
    },
    {
        property: 'last-name',
        name: 'Фамилия',
        headerClass: 'bold',
        cellClass: 'center'
    },
    {
        property: (data: any) => `${data['first-name']} ${data['last-name']}`,
        name: 'Пълно име',
        headerClass: 'bold',
        cellClass: 'center'
    },
    {
        property: 'age',
        name: 'Възраст',
        headerClass: 'bold',
        cellClass: 'center'
    },
    {
        property: 'city',
        name: 'Град',
        headerClass: 'bold',
        cellClass: 'left'
    },
    {
        property: 'payment',
        name: 'Заплата',
        headerClass: 'bold',
        cellClass: 'center',
        format: 'currency:BGN',
        //formatFn: (n: number) => `$${n.toFixed(2)}`
    },
    {
        property: 'has-certificate',
        name: 'Сертификат',
        headerClass: 'bold',
        formatFn: (value: any) => {
            if (value == undefined) {
                return '';
            }
            return value ? 'да' : 'не'
        },
        classValue: (value: any) => value ? 'green' : 'red'
    },
];

let format = {
    num: (n: number) => n.toFixed(2),
    int: (n: number) => n.toFixed(0),
    usd: (n: number) => `$${n.toFixed(2)}`,
    date: undefined
}

export let tableConfig = {
    columns: tableColumns,
    showHeader: true,
    rows: 4,
    canSelect: true,
    format,
    selectedRowClass: 'selected-row',
    onselect: (data: any) => {
        alert(`You've selected ${data}`);
    }
}